let webhooks = [];
const dismiss = () => {
        $("#name").val(""), $("#url").val(""), $("#secret").val(""), $("#is_active").prop("checked", !1), $("#flashes").empty()
    },
    saveWebhook = e => {
        let o = {
            name: $("#name").val(),
            url: $("#url").val(),
            secret: $("#secret").val(),
            is_active: $("#is_active").is(":checked")
        }; - 1 != e ? (o.id = parseInt(e), api.webhookId.put(o).success((function(e) {
            dismiss(), load(), $("#modal").modal("hide"), successFlash(`Webhook "${escapeHtml(o.name)}" has been updated successfully!`)
        })).error((function(e) {
            modalError(e.responseJSON.message)
        }))) : api.webhooks.post(o).success((function(e) {
            load(), dismiss(), $("#modal").modal("hide"), successFlash(`Webhook "${escapeHtml(o.name)}" has been created successfully!`)
        })).error((function(e) {
            modalError(e.responseJSON.message)
        }))
    },
    load = () => {
        $("#webhookTable").hide(), $("#loading").show(), api.webhooks.get().success((e => {
            webhooks = e, $("#loading").hide(), $("#webhookTable").show();
            let o = $("#webhookTable").DataTable({
                destroy: !0,
                columnDefs: [{
                    orderable: !1,
                    targets: "no-sort"
                }]
            });
            o.clear(), $.each(webhooks, ((e, t) => {
                o.row.add([escapeHtml(t.name), escapeHtml(t.url), escapeHtml(t.is_active), `\n                      <div class="pull-right">\n                        <button class="btn btn-primary ping_button" data-webhook-id="${t.id}">\n                          Ping\n                        </button>\n                        <button class="btn btn-primary edit_button" data-toggle="modal" data-backdrop="static" data-target="#modal" data-webhook-id="${t.id}">\n                          <i class="fa fa-pencil"></i>\n                        </button>\n                        <button class="btn btn-danger delete_button" data-webhook-id="${t.id}">\n                          <i class="fa fa-trash-o"></i>\n                        </button>\n                      </div>\n                    `]).draw()
            }))
        })).error((() => {
            errorFlash("Error fetching webhooks")
        }))
    },
    editWebhook = e => {
        $("#modalSubmit").unbind("click").click((() => {
            saveWebhook(e)
        })), -1 !== e ? ($("#webhookModalLabel").text("Edit Webhook"), api.webhookId.get(e).success((function(e) {
            $("#name").val(e.name), $("#url").val(e.url), $("#secret").val(e.secret), $("#is_active").prop("checked", e.is_active)
        })).error((function() {
            errorFlash("Error fetching webhook")
        }))) : $("#webhookModalLabel").text("New Webhook")
    },
    deleteWebhook = e => {
        var t = webhooks.find((o => o.id == e));
        o && Swal.fire({
            title: "Are you sure?",
            text: `This will delete the webhook '${escapeHtml(o.name)}'`,
            type: "warning",
            animation: !1,
            showCancelButton: !0,
            confirmButtonText: "Delete",
            confirmButtonColor: "#428bca",
            reverseButtons: !0,
            allowOutsideClick: !1,
            preConfirm: function() {
                return new Promise(((o, t) => {
                    api.webhookId.delete(e).success((e => {
                        o()
                    })).error((e => {
                        t(e.responseJSON.message)
                    }))
                })).catch((e => {
                    Swal.showValidationMessage(e)
                }))
            }
        }).then((function(e) {
            e.value && Swal.fire("Webhook Deleted!", "The webhook has been deleted!", "success"), $("button:contains('OK')").on("click", (function() {
                location.reload()
            }))
        }))
    },
    pingUrl = (e, o) => {
        dismiss(), e.disabled = !0, api.webhookId.ping(o).success((function(o) {
            e.disabled = !1, successFlash(`Ping of "${escapeHtml(o.name)}" webhook succeeded.`)
        })).error((function(t) {
            e.disabled = !1;
            var s = webhooks.find((e => e.id == o));
            s && errorFlash(`Ping of "${escapeHtml(s.name)}" webhook failed: "${escapeHtml(t.responseJSON.message)}"`)
        }))
    };
$(document).ready((function() {
    load(), $("#modal").on("hide.bs.modal", (function() {
        dismiss()
    })), $("#new_button").on("click", (function() {
        editWebhook(-1)
    })), $("#webhookTable").on("click", ".edit_button", (function(e) {
        editWebhook($(this).attr("data-webhook-id"))
    })), $("#webhookTable").on("click", ".delete_button", (function(e) {
        var o, t;
        o = $(this).attr("data-webhook-id"), (t = webhooks.find((e => e.id == o))) && Swal.fire({
            title: "Are you sure?",
            text: `This will delete the webhook '${escapeHtml(t.name)}'`,
            type: "warning",
            animation: !1,
            showCancelButton: !0,
            confirmButtonText: "Delete",
            confirmButtonColor: "#428bca",
            reverseButtons: !0,
            allowOutsideClick: !1,
            preConfirm: function() {
                return new Promise(((e, t) => {
                    api.webhookId.delete(o).success((o => {
                        e()
                    })).error((e => {
                        t(e.responseJSON.message)
                    }))
                })).catch((e => {
                    Swal.showValidationMessage(e)
                }))
            }
        }).then((function(e) {
            e.value && Swal.fire("Webhook Deleted!", "The webhook has been deleted!", "success"), $("button:contains('OK')").on("click", (function() {
                location.reload()
            }))
        }))
    })), $("#webhookTable").on("click", ".ping_button", (function(e) {
        var o, t;
        o = e.currentTarget, t = e.currentTarget.dataset.webhookId, dismiss(), o.disabled = !0, api.webhookId.ping(t).success((function(e) {
            o.disabled = !1, successFlash(`Ping of "${escapeHtml(e.name)}" webhook succeeded.`)
        })).error((function(e) {
            o.disabled = !1;
            var s = webhooks.find((e => e.id == t));
            s && errorFlash(`Ping of "${escapeHtml(s.name)}" webhook failed: "${escapeHtml(e.responseJSON.message)}"`)
        }))
    }))
}));