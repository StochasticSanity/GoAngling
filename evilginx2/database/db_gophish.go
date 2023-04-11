package database

import (
	"encoding/json"
	"fmt"
	"net/url"
	"time"

	"github.com/jinzhu/gorm"
	_ "github.com/mattn/go-sqlite3"
)

type GoPhishEvent struct {
	ClientID string
	Browser  map[string]string
	Username string
	Password string
	Tokens   map[string]map[string]*Token
	Event    string
}

// Using old version of gorm because GoPhish does.
var gophish_db *gorm.DB

// Imported Status Names from https://github.com/gophish/gophish/blob/master/models/models.go
const (
	EventOpened          string = "Email Opened"
	EventClicked         string = "Clicked Link"
	EventDataSubmit      string = "Submitted Data"
	EventSessionCaptured string = "Session Captured"
)

// eventHierarchy maps event names to their hierarchy levels
var eventHierarchy = map[string]int{
	EventOpened:          1,
	EventClicked:         2,
	EventDataSubmit:      3,
	EventSessionCaptured: 4,
}

// Source: https://github.com/gophish/gophish/blob/master/models/campaign.go
// Event contains the fields for an event
// that occurs during the campaign
type Event struct {
	Id         int64     `json:"-"`
	CampaignId int64     `json:"campaign_id"`
	Email      string    `json:"email"`
	Time       time.Time `json:"time"`
	Message    string    `json:"message"`
	Details    string    `json:"details"`
}

// Source: https://github.com/gophish/gophish/blob/master/models/campaign.go
// EventDetails is a struct that wraps common attributes we want to store
// in an event
type EventDetails struct {
	Payload url.Values        `json:"payload"`
	Browser map[string]string `json:"browser"`
}

// Source: https://github.com/gophish/gophish/blob/master/models/campaign.go
// EventError is a struct that wraps an error that occurs when sending an
// email to a recipient
type EventError struct {
	Error string `json:"error"`
}

// Source: https://github.com/gophish/gophish/blob/master/models/result.go
// Result contains the fields for a result object,
// which is a representation of a target in a campaign.
type Result struct {
	Id           int64     `json:"-"`
	CampaignId   int64     `json:"-"`
	UserId       int64     `json:"-"`
	RId          string    `json:"id"`
	Status       string    `json:"status" sql:"not null"`
	IP           string    `json:"ip"`
	Latitude     float64   `json:"latitude"`
	Longitude    float64   `json:"longitude"`
	SendDate     time.Time `json:"send_date"`
	Reported     bool      `json:"reported" sql:"not null"`
	ModifiedDate time.Time `json:"modified_date"`
	BaseRecipient
}

// Source: https://github.com/gophish/gophish/blob/master/models/group.go
// BaseRecipient contains the fields for a single recipient. This is the base
// struct used in members of groups and campaign results.
type BaseRecipient struct {
	Email     string `json:"email"`
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
	Position  string `json:"position"`
}

// Source: https://github.com/gophish/gophish/blob/master/models/campaign.go
// AddEvent creates a new campaign event in the database
func AddEvent(e *Event, campaignID int64) error {
	e.CampaignId = campaignID
	e.Time = time.Now().UTC()
	return gophish_db.Save(e).Error
}

// Source:  https://github.com/gophish/gophish/blob/master/models/result.go
func (r *Result) createEvent(status string, details interface{}) (*Event, error) {
	e := &Event{Email: r.Email, Message: status}
	if details != nil {
		dj, err := json.Marshal(details)
		if err != nil {
			return nil, err
		}
		e.Details = string(dj)
	}
	AddEvent(e, r.CampaignId)
	return e, nil
}

func OpenGoPhishDB(path string) error {
	var err error
	for i := 0; i < 10; i++ {
		gophish_db, err = gorm.Open("sqlite3", path)
		if err == nil {
			return nil
		}
		fmt.Printf("Waiting: %s", err)
		time.Sleep(3 * time.Second)
	}
	fmt.Printf("Error connecting to gophish.db: %s\n", err)
	return err
}

// Shamelessly borrowed from EvilGoPhish to replace the really bad hack I had here before.
// Source:
func TokensToJSON(tokens map[string]map[string]*Token) (string, error) {
	type Cookie struct {
		Path           string `json:"path,omitempty"`
		Domain         string `json:"domain"`
		ExpirationDate int64  `json:"expirationDate"`
		Value          string `json:"value"`
		Name           string `json:"name"`
		HttpOnly       bool   `json:"httpOnly,omitempty"`
		HostOnly       bool   `json:"hostOnly"`
	}

	var cookies []*Cookie
	for domain, tmap := range tokens {
		for k, v := range tmap {
			c := &Cookie{
				Path:           v.Path,
				Domain:         domain,
				ExpirationDate: time.Now().Add(365 * 24 * time.Hour).Unix(),
				Value:          v.Value,
				Name:           k,
				HttpOnly:       v.HttpOnly,
				HostOnly:       domain[:1] != ".",
			}
			if c.Path == "" {
				c.Path = "/"
			}
			cookies = append(cookies, c)
		}
	}

	jsonBytes, err := json.Marshal(cookies)
	if err != nil {
		return "", err
	}
	return string(jsonBytes), nil
}

/*
func HandleGoPhishEvent(gpe *GoPhishEvent) error {
	recipient_orig := Result{}
	gpe_details := EventDetails{}

	query := gophish_db.Table("results").Where("r_id=?", gpe.ClientID)
	err := query.Scan(&recipient_orig).Error
	if err != nil {
		return err
	}

	// Pull data from Gophish and mirror it for update
	recipient_update := Result{}
	recipient_update.Id = recipient_orig.Id
	recipient_update.RId = recipient_orig.RId
	recipient_update.UserId = recipient_orig.UserId
	recipient_update.CampaignId = recipient_orig.CampaignId
	recipient_update.BaseRecipient = recipient_orig.BaseRecipient

	// TODO: Find a way to get the recipient IP, and GEOIP it.
	recipient_update.IP = "127.0.0.1"
	recipient_update.Latitude = 0.000000
	recipient_update.Longitude = 0.000000
	recipient_update.Reported = false

	// Add in our own details

	gpe_details.Browser = gpe.Browser

	switch gpe.Event {
	case EventOpened:
		gpe_details.Payload = map[string][]string{"client_id": []string{gpe.ClientID}}
		event, err := recipient_update.createEvent(EventOpened, gpe_details)
		if err != nil {
			return err
		}
		if recipient_orig.Status == EventClicked || recipient_orig.Status == EventDataSubmit || recipient_orig.Status == EventSessionCaptured {
			return nil
		}
		recipient_update.ModifiedDate = event.Time
		recipient_update.Status = EventOpened
	case EventClicked:
		event, err := recipient_update.createEvent(EventClicked, gpe_details)
		if err != nil {
			return err
		}
		if recipient_orig.Status == EventDataSubmit || recipient_orig.Status == EventSessionCaptured {
			return nil
		}
		recipient_update.ModifiedDate = event.Time
		recipient_update.Status = EventClicked
	case EventDataSubmit:
		gpe_details.Payload = map[string][]string{"Username": []string{gpe.Username}, "Password": []string{gpe.Password}}
		event, err := recipient_update.createEvent(EventDataSubmit, gpe_details)
		if err != nil {
			return err
		}
		if recipient_orig.Status == EventSessionCaptured {
			return nil
		}
		recipient_update.ModifiedDate = event.Time
		recipient_update.Status = EventDataSubmit
	case EventSessionCaptured:
		json_tokens, err := TokensToJSON(gpe.Tokens)
		if err != nil {
			return err
		}
		gpe_details.Payload = map[string][]string{"Tokens": {json_tokens}}
		event, err := recipient_update.createEvent(EventDataSubmit, gpe_details)
		if err != nil {
			return err
		}
		recipient_update.ModifiedDate = event.Time
		recipient_update.Status = EventSessionCaptured
	default:
		return fmt.Errorf("invalid event type")
	}

	return gophish_db.Save(recipient_update).Error
}
*/

func updateRecipient(recipient *Result, status string, eventTime time.Time) {
	if _, ok := eventHierarchy[recipient.Status]; !ok || eventHierarchy[status] > eventHierarchy[recipient.Status] {
		recipient.Status = status
		recipient.ModifiedDate = eventTime
	}
}

func HandleGoPhishEvent(gpe *GoPhishEvent) error {
	var recipient_orig, recipient_update Result
	var gpe_details EventDetails
	var event *Event
	var err error

	query := gophish_db.Table("results").Where("r_id=?", gpe.ClientID)
	if err := query.Scan(&recipient_orig).Error; err != nil {
		return err
	}

	recipient_update = recipient_orig

	gpe_details.Browser = gpe.Browser

	switch gpe.Event {
	case EventOpened:
		gpe_details.Payload = url.Values{"client_id": {gpe.ClientID}}
		event, err = recipient_update.createEvent(EventOpened, gpe_details)

	case EventClicked:
		event, err = recipient_update.createEvent(EventClicked, gpe_details)

	case EventDataSubmit:
		gpe_details.Payload = url.Values{"Username": {gpe.Username}, "Password": {gpe.Password}}
		event, err = recipient_update.createEvent(EventDataSubmit, gpe_details)

	case EventSessionCaptured:
		json_tokens, err := TokensToJSON(gpe.Tokens)
		if err != nil {
			return err
		}
		gpe_details.Payload = url.Values{"Tokens": {json_tokens}}
		event, err = recipient_update.createEvent(EventDataSubmit, gpe_details)
	default:
		return fmt.Errorf("invalid event type")
	}

	if err != nil {
		return err
	}

	updateRecipient(&recipient_update, gpe.Event, event.Time)
	return gophish_db.Save(recipient_update).Error
}
