function errorFlash(e) {
    $("#flashes").empty(), $("#flashes").append('<div style="text-align:center" class="alert alert-danger">        <i class="fa fa-exclamation-circle"></i> ' + e + "</div>")
}

function successFlash(e) {
    $("#flashes").empty(), $("#flashes").append('<div style="text-align:center" class="alert alert-success">        <i class="fa fa-check-circle"></i> ' + e + "</div>")
}

function errorFlashFade(e, t) {
    $("#flashes").empty(), $("#flashes").append('<div style="text-align:center" class="alert alert-danger">        <i class="fa fa-exclamation-circle"></i> ' + e + "</div>"), setTimeout(function() {
        $("#flashes").empty()
    }, 1e3 * t)
}

function successFlashFade(e, t) {
    $("#flashes").empty(), $("#flashes").append('<div style="text-align:center" class="alert alert-success">        <i class="fa fa-check-circle"></i> ' + e + "</div>"), setTimeout(function() {
        $("#flashes").empty()
    }, 1e3 * t)
}

function modalError(e) {
    $("#modal\\.flashes").empty().append('<div style="text-align:center" class="alert alert-danger">        <i class="fa fa-exclamation-circle"></i> ' + e + "</div>")
}

function query(e, t, n, r) {
    return $.ajax({
        url: "/api" + e,
        async: r,
        method: t,
        data: JSON.stringify(n),
        dataType: "json",
        contentType: "application/json",
        beforeSend: function(e) {
            e.setRequestHeader("Authorization", "Bearer " + user.api_key)
        }
    })
}

function escapeHtml(e) {
    return $("<div/>").text(e).html()
}

function unescapeHtml(e) {
    return $("<div/>").html(e).text()
}
window.escapeHtml = escapeHtml;
var capitalize = function(e) {
        return e.charAt(0).toUpperCase() + e.slice(1)
    },
    api = {
        campaigns: {
            get: function() {
                return query("/campaigns/", "GET", {}, !1)
            },
            post: function(e) {
                return query("/campaigns/", "POST", e, !1)
            },
            summary: function() {
                return query("/campaigns/summary", "GET", {}, !1)
            }
        },
        campaignId: {
            get: function(e) {
                return query("/campaigns/" + e, "GET", {}, !0)
            },
            delete: function(e) {
                return query("/campaigns/" + e, "DELETE", {}, !1)
            },
            results: function(e) {
                return query("/campaigns/" + e + "/results", "GET", {}, !0)
            },
            complete: function(e) {
                return query("/campaigns/" + e + "/complete", "GET", {}, !0)
            },
            summary: function(e) {
                return query("/campaigns/" + e + "/summary", "GET", {}, !0)
            }
        },
        groups: {
            get: function() {
                return query("/groups/", "GET", {}, !1)
            },
            post: function(e) {
                return query("/groups/", "POST", e, !1)
            },
            summary: function() {
                return query("/groups/summary", "GET", {}, !0)
            }
        },
        groupId: {
            get: function(e) {
                return query("/groups/" + e, "GET", {}, !1)
            },
            put: function(e) {
                return query("/groups/" + e.id, "PUT", e, !1)
            },
            delete: function(e) {
                return query("/groups/" + e, "DELETE", {}, !1)
            }
        },
        templates: {
            get: function() {
                return query("/templates/", "GET", {}, !1)
            },
            post: function(e) {
                return query("/templates/", "POST", e, !1)
            }
        },
        templateId: {
            get: function(e) {
                return query("/templates/" + e, "GET", {}, !1)
            },
            put: function(e) {
                return query("/templates/" + e.id, "PUT", e, !1)
            },
            delete: function(e) {
                return query("/templates/" + e, "DELETE", {}, !1)
            }
        },
        pages: {
            get: function() {
                return query("/pages/", "GET", {}, !1)
            },
            post: function(e) {
                return query("/pages/", "POST", e, !1)
            }
        },
        pageId: {
            get: function(e) {
                return query("/pages/" + e, "GET", {}, !1)
            },
            put: function(e) {
                return query("/pages/" + e.id, "PUT", e, !1)
            },
            delete: function(e) {
                return query("/pages/" + e, "DELETE", {}, !1)
            }
        },
        SMTP: {
            get: function() {
                return query("/smtp/", "GET", {}, !1)
            },
            post: function(e) {
                return query("/smtp/", "POST", e, !1)
            }
        },
        SMTPId: {
            get: function(e) {
                return query("/smtp/" + e, "GET", {}, !1)
            },
            put: function(e) {
                return query("/smtp/" + e.id, "PUT", e, !1)
            },
            delete: function(e) {
                return query("/smtp/" + e, "DELETE", {}, !1)
            }
        },
        IMAP: {
            get: function() {
                return query("/imap/", "GET", {}, !1)
            },
            post: function(e) {
                return query("/imap/", "POST", e, !1)
            },
            validate: function(e) {
                return query("/imap/validate", "POST", e, !0)
            }
        },
        users: {
            get: function() {
                return query("/users/", "GET", {}, !0)
            },
            post: function(e) {
                return query("/users/", "POST", e, !0)
            }
        },
        userId: {
            get: function(e) {
                return query("/users/" + e, "GET", {}, !0)
            },
            put: function(e) {
                return query("/users/" + e.id, "PUT", e, !0)
            },
            delete: function(e) {
                return query("/users/" + e, "DELETE", {}, !0)
            }
        },
        webhooks: {
            get: function() {
                return query("/webhooks/", "GET", {}, !1)
            },
            post: function(e) {
                return query("/webhooks/", "POST", e, !1)
            }
        },
        webhookId: {
            get: function(e) {
                return query("/webhooks/" + e, "GET", {}, !1)
            },
            put: function(e) {
                return query("/webhooks/" + e.id, "PUT", e, !0)
            },
            delete: function(e) {
                return query("/webhooks/" + e, "DELETE", {}, !1)
            },
            ping: function(e) {
                return query("/webhooks/" + e + "/validate", "POST", {}, !0)
            }
        },
        import_email: function(e) {
            return query("/import/email", "POST", e, !1)
        },
        clone_site: function(e) {
            return query("/import/site", "POST", e, !1)
        },
        send_test_email: function(e) {
            return query("/util/send_test_email", "POST", e, !0)
        },
        reset: function() {
            return query("/reset", "POST", {}, !0)
        }
    };
window.api = api, $(document).ready(function() {
    var t = location.pathname;
    $(".nav-sidebar li").each(function() {
        var e = $(this);
        e.find("a").attr("href") === t && e.addClass("active")
    }), $.fn.dataTable.moment("MMMM Do YYYY, h:mm:ss a"), $('[data-toggle="tooltip"]').tooltip()
});