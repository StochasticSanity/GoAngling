$(document).ready(function() {
    function t() {
        api.IMAP.get().success(function(e) {
            0 == e.length ? $("#lastlogindiv").hide() : (0 == (e = e[0]).enabled ? $("#lastlogindiv").hide() : $("#lastlogindiv").show(), $("#imapusername").val(e.username), $("#imaphost").val(e.host), $("#imapport").val(e.port), $("#imappassword").val(e.password), $("#use_tls").prop("checked", e.tls), $("#ignorecerterrors").prop("checked", e.ignore_cert_errors), $("#use_imap").prop("checked", e.enabled), $("#folder").val(e.folder), $("#restrictdomain").val(e.restrict_domain), $("#deletecampaign").prop("checked", e.delete_reported_campaign_email), $("#lastloginraw").val(e.last_login), $("#lastlogin").val(moment.utc(e.last_login).fromNow()), $("#imapfreq").val(e.imap_freq))
        }).error(function() {
            errorFlash("Error fetching IMAP settings")
        })
    }
    $('[data-toggle="tooltip"]').tooltip(), $("#apiResetForm").submit(function(e) {
        return api.reset().success(function(e) {
            user.api_key = e.data, successFlash(e.message), $("#api_key").val(user.api_key)
        }).error(function(e) {
            errorFlash(e.message)
        }), !1
    }), $("#settingsForm").submit(function(e) {
        return $.post("/settings", $(this).serialize()).done(function(e) {
            successFlash(e.message)
        }).fail(function(e) {
            errorFlash(e.responseJSON.message)
        }), !1
    }), $("#savesettings").click(function() {
        var e = {};
        return e.host = $("#imaphost").val(), e.port = $("#imapport").val(), e.username = $("#imapusername").val(), e.password = $("#imappassword").val(), e.enabled = $("#use_imap").prop("checked"), e.tls = $("#use_tls").prop("checked"), e.folder = $("#folder").val(), e.imap_freq = $("#imapfreq").val(), e.restrict_domain = $("#restrictdomain").val(), e.ignore_cert_errors = $("#ignorecerterrors").prop("checked"), e.delete_reported_campaign_email = $("#deletecampaign").prop("checked"), "" == e.host ? (errorFlash("No IMAP Host specified"), document.body.scrollTop = 0, document.documentElement.scrollTop = 0) : "" == e.port ? (errorFlash("No IMAP Port specified"), document.body.scrollTop = 0, document.documentElement.scrollTop = 0) : isNaN(e.port) || e.port < 1 || 65535 < e.port ? (errorFlash("Invalid IMAP Port"), document.body.scrollTop = 0, document.documentElement.scrollTop = 0) : ("" == e.imap_freq && (e.imap_freq = "60"), api.IMAP.post(e).done(function(e) {
            1 == e.success ? successFlashFade("Successfully updated IMAP settings.", 2) : errorFlash("Unable to update IMAP settings.")
        }).success(function(e) {
            t()
        }).fail(function(e) {
            errorFlash(e.responseJSON.message)
        }).always(function(e) {
            document.body.scrollTop = 0, document.documentElement.scrollTop = 0
        })), !1
    }), $("#validateimap").click(function() {
        var e = {};
        if (e.host = $("#imaphost").val(), e.port = $("#imapport").val(), e.username = $("#imapusername").val(), e.password = $("#imappassword").val(), e.tls = $("#use_tls").prop("checked"), e.ignore_cert_errors = $("#ignorecerterrors").prop("checked"), "" == e.host) return errorFlash("No IMAP Host specified"), document.body.scrollTop = 0, document.documentElement.scrollTop = 0, !1;
        if ("" == e.port) return errorFlash("No IMAP Port specified"), document.body.scrollTop = 0, document.documentElement.scrollTop = 0, !1;
        if (isNaN(e.port) || e.port < 1 || 65535 < e.port) return errorFlash("Invalid IMAP Port"), document.body.scrollTop = 0, document.documentElement.scrollTop = 0, !1;
        var t = $("#validateimap").html();
        $("#imaphost").attr("disabled", !0), $("#imapport").attr("disabled", !0), $("#imapusername").attr("disabled", !0), $("#imappassword").attr("disabled", !0), $("#use_imap").attr("disabled", !0), $("#use_tls").attr("disabled", !0), $("#ignorecerterrors").attr("disabled", !0), $("#folder").attr("disabled", !0), $("#restrictdomain").attr("disabled", !0), $("#deletecampaign").attr("disabled", !0), $("#lastlogin").attr("disabled", !0), $("#imapfreq").attr("disabled", !0), $("#validateimap").attr("disabled", !0), $("#validateimap").html("<i class='fa fa-circle-o-notch fa-spin'></i> Testing..."), api.IMAP.validate(e).done(function(t) {
            1 == t.success ? Swal.fire({
                title: "Success",
                html: "Logged into <b>" + escapeHtml($("#imaphost").val()) + "</b>",
                type: "success"
            }) : Swal.fire({
                title: "Failed!",
                html: "Unable to login to <b>" + escapeHtml($("#imaphost").val()) + "</b>.",
                type: "error",
                showCancelButton: !0,
                cancelButtonText: "Close",
                confirmButtonText: "More Info",
                confirmButtonColor: "#428bca",
                allowOutsideClick: !1
            }).then(function(e) {
                e.value && Swal.fire({
                    title: "Error:",
                    text: t.message
                })
            })
        }).fail(function() {
            Swal.fire({
                title: "Failed!",
                text: "An unecpected error occured.",
                type: "error"
            })
        }).always(function() {
            $("#imaphost").attr("disabled", !1), $("#imapport").attr("disabled", !1), $("#imapusername").attr("disabled", !1), $("#imappassword").attr("disabled", !1), $("#use_imap").attr("disabled", !1), $("#use_tls").attr("disabled", !1), $("#ignorecerterrors").attr("disabled", !1), $("#folder").attr("disabled", !1), $("#restrictdomain").attr("disabled", !1), $("#deletecampaign").attr("disabled", !1), $("#lastlogin").attr("disabled", !1), $("#imapfreq").attr("disabled", !1), $("#validateimap").attr("disabled", !1), $("#validateimap").html(t)
        })
    }), $("#reporttab").click(function() {
        t()
    }), $("#advanced").click(function() {
        $("#advancedarea").toggle()
    });
    var e = localStorage.getItem("gophish.use_map");
    $("#use_map").prop("checked", JSON.parse(e)), $("#use_map").on("change", function() {
        localStorage.setItem("gophish.use_map", JSON.stringify(this.checked))
    }), t()
});