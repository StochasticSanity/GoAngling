var map = null,
    doPoll = !0,
    statuses = {
        "Email Sent": {
            color: "#1abc9c",
            label: "label-success",
            icon: "fa-envelope",
            point: "ct-point-sent"
        },
        "Emails Sent": {
            color: "#1abc9c",
            label: "label-success",
            icon: "fa-envelope",
            point: "ct-point-sent"
        },
        "In progress": {
            label: "label-primary"
        },
        Queued: {
            label: "label-info"
        },
        Completed: {
            label: "label-success"
        },
        "Email Opened": {
            color: "#f9bf3b",
            label: "label-warning",
            icon: "fa-envelope-open",
            point: "ct-point-opened"
        },
        "Clicked Link": {
            color: "#F39C12",
            label: "label-clicked",
            icon: "fa-mouse-pointer",
            point: "ct-point-clicked"
        },
        Success: {
            color: "#f05b4f",
            label: "label-danger",
            icon: "fa-exclamation",
            point: "ct-point-clicked"
        },
        "Email Reported": {
            color: "#45d6ef",
            label: "label-info",
            icon: "fa-bullhorn",
            point: "ct-point-reported"
        },
        Error: {
            color: "#6c7a89",
            label: "label-default",
            icon: "fa-times",
            point: "ct-point-error"
        },
        "Error Sending Email": {
            color: "#6c7a89",
            label: "label-default",
            icon: "fa-times",
            point: "ct-point-error"
        },
        "Submitted Data": {
            color: "#f05b4f",
            label: "label-danger",
            icon: "fa-exclamation",
            point: "ct-point-clicked"
        },
        "Session Captured": {
            color: "#7a1010",
            label: "label-captured",
            icon: "fa-exclamation",
            point: "ct-point-clicked"
        },
        Unknown: {
            color: "#6c7a89",
            label: "label-default",
            icon: "fa-question",
            point: "ct-point-error"
        },
        Sending: {
            color: "#428bca",
            label: "label-primary",
            icon: "fa-spinner",
            point: "ct-point-sending"
        },
        Retrying: {
            color: "#6c7a89",
            label: "label-default",
            icon: "fa-clock-o",
            point: "ct-point-error"
        },
        Scheduled: {
            color: "#428bca",
            label: "label-primary",
            icon: "fa-clock-o",
            point: "ct-point-sending"
        },
        "Campaign Created": {
            label: "label-success",
            icon: "fa-rocket"
        }
    },
    statusMapping = {
        "Email Sent": "sent",
        "Email Opened": "opened",
        "Clicked Link": "clicked",
        "Submitted Data": "submitted_data",
        "Session Captured": "session_captured",
        "Email Reported": "reported"
    },
    progressListing = ["Email Sent", "Email Opened", "Clicked Link", "Submitted Data", "Session Captured"],
    campaign = {},
    bubbles = [];

function dismiss() {
    $("#modal\\.flashes").empty(), $("#modal").modal("hide"), $("#resultsTable").dataTable().DataTable().clear().draw()
}

function deleteCampaign() {
    Swal.fire({
        title: "Are you sure?",
        text: "This will delete the campaign. This can't be undone!",
        type: "warning",
        animation: !1,
        showCancelButton: !0,
        confirmButtonText: "Delete Campaign",
        confirmButtonColor: "#428bca",
        reverseButtons: !0,
        allowOutsideClick: !1,
        showLoaderOnConfirm: !0,
        preConfirm: function() {
            return new Promise(function(t, a) {
                api.campaignId.delete(campaign.id).success(function(e) {
                    t()
                }).error(function(e) {
                    a(e.responseJSON.message)
                })
            })
        }
    }).then(function(e) {
        e.value && Swal.fire("Campaign Deleted!", "This campaign has been deleted!", "success"), $('button:contains("OK")').on("click", function() {
            location.href = "/campaigns"
        })
    })
}

function completeCampaign() {
    Swal.fire({
        title: "Are you sure?",
        text: "Gophish will stop processing events for this campaign",
        type: "warning",
        animation: !1,
        showCancelButton: !0,
        confirmButtonText: "Complete Campaign",
        confirmButtonColor: "#428bca",
        reverseButtons: !0,
        allowOutsideClick: !1,
        showLoaderOnConfirm: !0,
        preConfirm: function() {
            return new Promise(function(t, a) {
                api.campaignId.complete(campaign.id).success(function(e) {
                    t()
                }).error(function(e) {
                    a(e.responseJSON.message)
                })
            })
        }
    }).then(function(e) {
        e.value && (Swal.fire("Campaign Completed!", "This campaign has been completed!", "success"), $("#complete_button")[0].disabled = !0, $("#complete_button").text("Completed!"), doPoll = !1)
    })
}

function exportAsCSV(e) {
    exportHTML = $("#exportButton").html();
    var t = null,
        a = campaign.name + " - " + capitalize(e) + ".csv";
    switch (e) {
        case "results":
            t = campaign.results;
            break;
        case "events":
            t = campaign.timeline
    }
    if (t) {
        $("#exportButton").html('<i class="fa fa-spinner fa-spin"></i>');
        var s = Papa.unparse(t, {
                escapeFormulae: !0
            }),
            i = new Blob([s], {
                type: "text/csv;charset=utf-8;"
            });
        if (navigator.msSaveBlob) navigator.msSaveBlob(i, a);
        else {
            var l = window.URL.createObjectURL(i),
                n = document.createElement("a");
            n.href = l, n.setAttribute("download", a), document.body.appendChild(n), n.click(), document.body.removeChild(n)
        }
        $("#exportButton").html(exportHTML)
    }
}

function replay(e) {
    return request = campaign.timeline[e], details = JSON.parse(request.details), url = null, form = $("<form>").attr({
        method: "POST",
        target: "_blank"
    }), $.each(Object.keys(details.payload), function(e, t) {
        return "rid" == t || ("__original_url" == t ? (url = details.payload[t], !0) : void $("<input>").attr({
            name: t
        }).val(details.payload[t]).appendTo(form))
    }), void Swal.fire({
        title: "Where do you want the credentials submitted to?",
        input: "text",
        showCancelButton: !0,
        inputPlaceholder: "http://example.com/login",
        inputValue: url || "",
        inputValidator: function(a) {
            return new Promise(function(e, t) {
                a ? e() : t("Invalid URL.")
            })
        }
    }).then(function(e) {
        e.value && (url = e.value, t())
    });

    function t() {
        form.attr({
            action: url
        }), form.appendTo("body").submit().remove()
    }
}
var renderDevice = function(e) {
    var t = UAParser(details.browser["user-agent"]),
        a = '<div class="timeline-device-details">',
        s = "laptop";
    t.device.type && ("tablet" != t.device.type && "mobile" != t.device.type || (s = t.device.type));
    var i = "";
    t.device.vendor && "microsoft" == (i = t.device.vendor.toLowerCase()) && (i = "windows");
    var l = "Unknown";
    t.os.name && ("Mac OS" == (l = t.os.name) ? i = "apple" : "Windows" == l && (i = "windows"), t.device.vendor && t.device.model && (l = t.device.vendor + " " + t.device.model)), t.os.version && (l = l + " (OS Version: " + t.os.version + ")"), deviceString = '<div class="timeline-device-os"><span class="fa fa-stack"><i class="fa fa-' + escapeHtml(s) + ' fa-stack-2x"></i><i class="fa fa-vendor-icon fa-' + escapeHtml(i) + ' fa-stack-1x"></i></span> ' + escapeHtml(l) + "</div>", a += deviceString;
    var n = "Unknown",
        r = "info-circle",
        o = "";
    return t.browser && t.browser.name && ((n = (n = t.browser.name).replace("Mobile ", "")) && "ie" == (r = n.toLowerCase()) && (r = "internet-explorer"), o = "(Version: " + t.browser.version + ")"), a += '<div class="timeline-device-browser"><span class="fa fa-stack"><i class="fa fa-' + escapeHtml(r) + ' fa-stack-1x"></i></span> ' + n + " " + o + "</div>", a += "</div>"
};

function renderTimeline(e) {
    return record = {
        id: e[0],
        first_name: e[2],
        last_name: e[3],
        email: e[4],
        position: e[5],
        status: e[6],
        reported: e[7],
        send_date: e[8]
    }, results = '<div class="timeline col-sm-12 well well-lg"><h6>Timeline for ' + escapeHtml(record.first_name) + " " + escapeHtml(record.last_name) + '</h6><span class="subtitle">Email: ' + escapeHtml(record.email) + "<br>Result ID: " + escapeHtml(record.id) + '</span><div class="timeline-graph col-sm-6">', $.each(campaign.timeline, function(e, t) {
        t.email && t.email != record.email || (results += '<div class="timeline-entry">    <div class="timeline-bar"></div>', results += '    <div class="timeline-icon ' + statuses[t.message].label + '">    <i class="fa ' + statuses[t.message].icon + '"></i></div>    <div class="timeline-message">' + escapeHtml(t.message) + '    <span class="timeline-date">' + moment.utc(t.time).local().format("MMMM Do YYYY h:mm:ss a") + "</span>", t.details && (details = JSON.parse(t.details), "Clicked Link" != t.message && "Submitted Data" != t.message || (deviceView = renderDevice(details), deviceView && (results += deviceView)), "Submitted Data" == t.message && (results += '<div class="timeline-replay-button"><button onclick="replay(' + e + ')" class="btn btn-success">', results += '<i class="fa fa-refresh"></i> Replay Credentials</button></div>', results += '<div class="timeline-event-details"><i class="fa fa-caret-right"></i> View Details</div>'), details.payload && (results += '<div class="timeline-event-results">', results += '    <table class="table table-condensed table-bordered table-striped">', results += "        <thead><tr><th>Parameter</th><th>Value(s)</tr></thead><tbody>", $.each(Object.keys(details.payload), function(e, t) {
            if ("rid" == t) return !0;
            results += "    <tr>", results += "        <td>" + escapeHtml(t) + "</td>", results += "        <td>" + escapeHtml(details.payload[t]) + "</td>", results += "    </tr>"
        }), results += "       </tbody></table>", results += "</div>"), details.error && (results += '<div class="timeline-event-details"><i class="fa fa-caret-right"></i> View Details</div>', results += '<div class="timeline-event-results">', results += '<span class="label label-default">Error</span> ' + details.error, results += "</div>")), results += "</div></div>")
    }), "Scheduled" != record.status && "Retrying" != record.status || (results += '<div class="timeline-entry">    <div class="timeline-bar"></div>', results += '    <div class="timeline-icon ' + statuses[record.status].label + '">    <i class="fa ' + statuses[record.status].icon + '"></i></div>    <div class="timeline-message">Scheduled to send at ' + record.send_date + "</span>"), results += "</div></div>", results
}
var setRefresh, renderTimelineChart = function(e) {
        return Highcharts.chart("timeline_chart", {
            chart: {
                zoomType: "x",
                type: "line",
                height: "200px"
            },
            title: {
                text: "Campaign Timeline"
            },
            xAxis: {
                type: "datetime",
                dateTimeLabelFormats: {
                    second: "%l:%M:%S",
                    minute: "%l:%M",
                    hour: "%l:%M",
                    day: "%b %d, %Y",
                    week: "%b %d, %Y",
                    month: "%b %Y"
                }
            },
            yAxis: {
                min: 0,
                max: 2,
                visible: !1,
                tickInterval: 1,
                labels: {
                    enabled: !1
                },
                title: {
                    text: ""
                }
            },
            tooltip: {
                formatter: function() {
                    return Highcharts.dateFormat("%A, %b %d %l:%M:%S %P", new Date(this.x)) + "<br>Event: " + this.point.message + "<br>Email: <b>" + this.point.email + "</b>"
                }
            },
            legend: {
                enabled: !1
            },
            plotOptions: {
                series: {
                    marker: {
                        enabled: !0,
                        symbol: "circle",
                        radius: 3
                    },
                    cursor: "pointer"
                },
                line: {
                    states: {
                        hover: {
                            lineWidth: 1
                        }
                    }
                }
            },
            credits: {
                enabled: !1
            },
            series: [{
                data: e.data,
                dashStyle: "shortdash",
                color: "#cccccc",
                lineWidth: 1,
                turboThreshold: 0
            }]
        })
    },
    renderPieChart = function(l) {
        return Highcharts.chart(l.elemId, {
            chart: {
                type: "pie",
                events: {
                    load: function() {
                        var e = this,
                            t = e.renderer,
                            a = e.series[0],
                            s = e.plotLeft + a.center[0],
                            i = e.plotTop + a.center[1];
                        this.innerText = t.text(l.data[0].count, s, i).attr({
                            "text-anchor": "middle",
                            "font-size": "24px",
                            "font-weight": "bold",
                            fill: l.colors[0],
                            "font-family": "Helvetica,Arial,sans-serif"
                        }).add()
                    },
                    render: function() {
                        this.innerText.attr({
                            text: l.data[0].count
                        })
                    }
                }
            },
            title: {
                text: l.title
            },
            plotOptions: {
                pie: {
                    innerSize: "80%",
                    dataLabels: {
                        enabled: !1
                    }
                }
            },
            credits: {
                enabled: !1
            },
            tooltip: {
                formatter: function() {
                    return null != this.key && '<span style="color:' + this.color + '">●</span>' + this.point.name + ": <b>" + this.y + "%</b><br/>"
                }
            },
            series: [{
                data: l.data,
                colors: l.colors
            }]
        })
    },
    updateMap = function(e) {
        map && (bubbles = [], $.each(campaign.results, function(e, a) {
            if (0 == a.latitude && 0 == a.longitude) return !0;
            newIP = !0, $.each(bubbles, function(e, t) {
                if (t.ip == a.ip) return bubbles[e].radius += 1, newIP = !1
            }), newIP && bubbles.push({
                latitude: a.latitude,
                longitude: a.longitude,
                name: a.ip,
                fillKey: "point",
                radius: 2
            })
        }), map.bubbles(bubbles))
    };

function createStatusLabel(e, t) {
    var a = statuses[e].label || "label-default",
        s = '<span class="label ' + a + '">' + e + "</span>";
    "Scheduled" != e && "Retrying" != e || (s = '<span class="label ' + a + '" data-toggle="tooltip" data-placement="top" data-html="true" title="' + ("Scheduled to send at " + t) + '">' + e + "</span>");
    return s
}

function poll() {
    api.campaignId.results(campaign.id).success(function(e) {
        campaign = e;
        var s = [];
        $.each(campaign.timeline, function(e, t) {
            var a = moment.utc(t.time).local();
            s.push({
                email: t.email,
                message: t.message,
                x: a.valueOf(),
                y: 1,
                marker: {
                    fillColor: statuses[t.message].color
                }
            })
        }), $("#timeline_chart").highcharts().series[0].update({
            data: s
        });
        var i = {};
        Object.keys(statusMapping).forEach(function(e) {
            i[e] = 0
        }), $.each(campaign.results, function(e, t) {
            i[t.status]++, t.reported && i["Email Reported"]++;
            var a = progressListing.indexOf(t.status);
            for (e = 0; e < a; e++) i[progressListing[e]]++
        }), $.each(i, function(e, t) {
            var a = [];
            if (!(e in statusMapping)) return !0;
            a.push({
                name: e,
                y: Math.floor(t / campaign.results.length * 100),
                count: t
            }), a.push({
                name: "",
                y: 100 - Math.floor(t / campaign.results.length * 100)
            }), $("#" + statusMapping[e] + "_chart").highcharts().series[0].update({
                data: a
            })
        }), resultsTable = $("#resultsTable").DataTable(), resultsTable.rows().every(function(a, e, t) {
            var s = this.row(a),
                i = s.data(),
                l = i[0];
            $.each(campaign.results, function(e, t) {
                if (t.id == l) return i[8] = moment(t.send_date).format("MMMM Do YYYY, h:mm:ss a"), i[7] = t.reported, i[6] = t.status, resultsTable.row(a).data(i), s.child.isShown() && ($(s.node()).find("#caret").removeClass("fa-caret-right"), $(s.node()).find("#caret").addClass("fa-caret-down"), s.child(renderTimeline(s.data()))), !1
            })
        }), resultsTable.draw(!1), updateMap(campaign.results), $('[data-toggle="tooltip"]').tooltip(), $("#refresh_message").hide(), $("#refresh_btn").show()
    })
}

function load() {
    campaign.id = window.location.pathname.split("/").slice(-1)[0];
    var t = JSON.parse(localStorage.getItem("gophish.use_map"));
    api.campaignId.results(campaign.id).success(function(e) {
        if (campaign = e) {
            $("title").text(e.name + " - Gophish"), $("#loading").hide(), $("#campaignResults").show(), $("#page-title").text("Results for " + e.name), "Completed" == e.status && ($("#complete_button")[0].disabled = !0, $("#complete_button").text("Completed!"), doPoll = !1), $("#resultsTable").on("click", ".timeline-event-details", function() {
                payloadResults = $(this).parent().find(".timeline-event-results"), payloadResults.is(":visible") ? ($(this).find("i").removeClass("fa-caret-down"), $(this).find("i").addClass("fa-caret-right"), payloadResults.hide()) : ($(this).find("i").removeClass("fa-caret-right"), $(this).find("i").addClass("fa-caret-down"), payloadResults.show())
            }), resultsTable = $("#resultsTable").DataTable({
                destroy: !0,
                order: [
                    [2, "asc"]
                ],
                columnDefs: [{
                    orderable: !1,
                    targets: "no-sort"
                }, {
                    className: "details-control",
                    targets: [1]
                }, {
                    visible: !1,
                    targets: [0, 8]
                }, {
                    render: function(e, t, a) {
                        return createStatusLabel(e, a[8])
                    },
                    targets: [6]
                }, {
                    className: "text-center",
                    render: function(e, t, a) {
                        return "display" == t ? e ? "<i class='fa fa-check-circle text-center text-success'></i>" : "<i role='button' class='fa fa-times-circle text-center text-muted' onclick='report_mail(\"" + a[0] + '", "' + campaign.id + "\");'></i>" : e
                    },
                    targets: [7]
                }]
            }), resultsTable.clear();
            var s = {},
                i = [];
            Object.keys(statusMapping).forEach(function(e) {
                s[e] = 0
            }), $.each(campaign.results, function(e, t) {
                resultsTable.row.add([t.id, '<i id="caret" class="fa fa-caret-right"></i>', escapeHtml(t.first_name) || "", escapeHtml(t.last_name) || "", escapeHtml(t.email) || "", escapeHtml(t.position) || "", t.status, t.reported, moment(t.send_date).format("MMMM Do YYYY, h:mm:ss a")]), s[t.status]++, t.reported && s["Email Reported"]++;
                var a = progressListing.indexOf(t.status);
                for (e = 0; e < a; e++) s[progressListing[e]]++
            }), resultsTable.draw(), $('[data-toggle="tooltip"]').tooltip(), $("#resultsTable tbody").on("click", "td.details-control", function() {
                var e = $(this).closest("tr"),
                    t = resultsTable.row(e);
                t.child.isShown() ? (t.child.hide(), e.removeClass("shown"), $(this).find("i").removeClass("fa-caret-down"), $(this).find("i").addClass("fa-caret-right")) : ($(this).find("i").removeClass("fa-caret-right"), $(this).find("i").addClass("fa-caret-down"), t.child(renderTimeline(t.data())).show(), e.addClass("shown"))
            }), $.each(campaign.timeline, function(e, t) {
                if ("Campaign Created" == t.message) return !0;
                var a = moment.utc(t.time).local();
                i.push({
                    email: t.email,
                    message: t.message,
                    x: a.valueOf(),
                    y: 1,
                    marker: {
                        fillColor: statuses[t.message].color
                    }
                })
            }), renderTimelineChart({
                data: i
            }), $.each(s, function(e, t) {
                var a = [];
                if (!(e in statusMapping)) return !0;
                a.push({
                    name: e,
                    y: Math.floor(t / campaign.results.length * 100),
                    count: t
                }), a.push({
                    name: "",
                    y: 100 - Math.floor(t / campaign.results.length * 100)
                });
                renderPieChart({
                    elemId: statusMapping[e] + "_chart",
                    title: e,
                    name: e,
                    data: a,
                    colors: [statuses[e].color, "#dddddd"]
                })
            }), t && ($("#resultsMapContainer").show(), map = new Datamap({
                element: document.getElementById("resultsMap"),
                responsive: !0,
                fills: {
                    defaultFill: "#ffffff",
                    point: "#283F50"
                },
                geographyConfig: {
                    highlightFillColor: "#1abc9c",
                    borderColor: "#283F50"
                },
                bubblesConfig: {
                    borderColor: "#283F50"
                }
            })), updateMap(campaign.results)
        }
    }).error(function() {
        $("#loading").hide(), errorFlash(" Campaign not found!")
    })
}

function refresh() {
    doPoll && ($("#refresh_message").show(), $("#refresh_btn").hide(), poll(), clearTimeout(setRefresh), setRefresh = setTimeout(refresh, 6e4))
}

function report_mail(t, a) {
    Swal.fire({
        title: "Are you sure?",
        text: "This result will be flagged as reported (RID: " + t + ")",
        type: "question",
        animation: !1,
        showCancelButton: !0,
        confirmButtonText: "Continue",
        confirmButtonColor: "#428bca",
        reverseButtons: !0,
        allowOutsideClick: !1,
        showLoaderOnConfirm: !0
    }).then(function(e) {
        e.value && api.campaignId.get(a).success(function(e) {
            report_url = new URL(e.url), report_url.pathname = "/report", report_url.search = "?rid=" + t, $.ajax({
                url: report_url,
                method: "GET",
                success: function(e) {
                    refresh()
                }
            })
        })
    })
}
$(document).ready(function() {
    Highcharts.setOptions({
        global: {
            useUTC: !1
        }
    }), load(), setRefresh = setTimeout(refresh, 6e4)
});