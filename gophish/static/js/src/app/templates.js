var templates = [],
    icons = {
        "application/vnd.ms-excel": "fa-file-excel-o",
        "text/plain": "fa-file-text-o",
        "image/gif": "fa-file-image-o",
        "image/png": "fa-file-image-o",
        "application/pdf": "fa-file-pdf-o",
        "application/x-zip-compressed": "fa-file-archive-o",
        "application/x-gzip": "fa-file-archive-o",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation": "fa-file-powerpoint-o",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "fa-file-word-o",
        "application/octet-stream": "fa-file-o",
        "application/x-msdownload": "fa-file-o"
    };

function save(e) {
    var t = {
        attachments: []
    };
    t.name = $("#name").val(), t.subject = $("#subject").val(), t.envelope_sender = $("#envelope-sender").val(), t.html = CKEDITOR.instances.html_editor.getData(), t.html = t.html.replace(/https?:\/\/{{\.URL}}/gi, "{{.URL}}"), $("#use_tracker_checkbox").prop("checked") ? -1 == t.html.indexOf("{{.Tracker}}") && -1 == t.html.indexOf("{{.TrackingUrl}}") && (t.html = t.html.replace("</body>", "{{.Tracker}}</body>")) : t.html = t.html.replace("{{.Tracker}}</body>", "</body>"), t.text = $("#text_editor").val(), $.each($("#attachmentsTable").DataTable().rows().data(), (function(e, a) {
        t.attachments.push({
            name: unescapeHtml(a[1]),
            content: a[3],
            type: a[4]
        })
    })), -1 != e ? (t.id = templates[e].id, api.templateId.put(t).success((function(e) {
        successFlash("Template edited successfully!"), load(), dismiss()
    })).error((function(e) {
        modalError(e.responseJSON.message)
    }))) : api.templates.post(t).success((function(e) {
        successFlash("Template added successfully!"), load(), dismiss()
    })).error((function(e) {
        modalError(e.responseJSON.message)
    }))
}

function dismiss() {
    $("#modal\\.flashes").empty(), $("#attachmentsTable").dataTable().DataTable().clear().draw(), $("#name").val(""), $("#subject").val(""), $("#text_editor").val(""), $("#html_editor").val(""), $("#modal").modal("hide")
}
var deleteTemplate = function(e) {
    Swal.fire({
        title: "Are you sure?",
        text: "This will delete the template. This can't be undone!",
        type: "warning",
        animation: !1,
        showCancelButton: !0,
        confirmButtonText: "Delete " + escapeHtml(templates[e].name),
        confirmButtonColor: "#428bca",
        reverseButtons: !0,
        allowOutsideClick: !1,
        preConfirm: function() {
            return new Promise((function(t, a) {
                api.templateId.delete(templates[e].id).success((function(e) {
                    t()
                })).error((function(e) {
                    a(e.responseJSON.message)
                }))
            }))
        }
    }).then((function(e) {
        e.value && Swal.fire("Template Deleted!", "This template has been deleted!", "success"), $('button:contains("OK")').on("click", (function() {
            location.reload()
        }))
    }))
};

function deleteTemplate(e) {
    confirm("Delete " + templates[e].name + "?") && api.templateId.delete(templates[e].id).success((function(e) {
        successFlash(e.message), load()
    }))
}

function attach(e) {
    attachmentsTable = $("#attachmentsTable").DataTable({
        destroy: !0,
        order: [
            [1, "asc"]
        ],
        columnDefs: [{
            orderable: !1,
            targets: "no-sort"
        }, {
            sClass: "datatable_hidden",
            targets: [3, 4]
        }]
    }), $.each(e, (function(e, t) {
        var a = new FileReader;
        a.onload = function(e) {
            var o = icons[t.type] || "fa-file-o";
            attachmentsTable.row.add(['<i class="fa ' + o + '"></i>', escapeHtml(t.name), '<span class="remove-row"><i class="fa fa-trash-o"></i></span>', a.result.split(",")[1], t.type || "application/octet-stream"]).draw()
        }, a.onerror = function(e) {
            console.log(e)
        }, a.readAsDataURL(t)
    }))
}

function edit(e) {
    $("#modalSubmit").unbind("click").click((function() {
        save(e)
    })), $("#attachmentUpload").unbind("click").click((function() {
        this.value = null
    })), $("#html_editor").ckeditor(), setupAutocomplete(CKEDITOR.instances.html_editor), $("#attachmentsTable").show(), attachmentsTable = $("#attachmentsTable").DataTable({
        destroy: !0,
        order: [
            [1, "asc"]
        ],
        columnDefs: [{
            orderable: !1,
            targets: "no-sort"
        }, {
            sClass: "datatable_hidden",
            targets: [3, 4]
        }]
    });
    var t = {
        attachments: []
    }; - 1 != e ? ($("#templateModalLabel").text("Edit Template"), t = templates[e], $("#name").val(t.name), $("#subject").val(t.subject), $("#envelope-sender").val(t.envelope_sender), $("#html_editor").val(t.html), $("#text_editor").val(t.text), attachmentRows = [], $.each(t.attachments, (function(e, t) {
        var a = icons[t.type] || "fa-file-o";
        attachmentRows.push(['<i class="fa ' + a + '"></i>', escapeHtml(t.name), '<span class="remove-row"><i class="fa fa-trash-o"></i></span>', t.content, t.type || "application/octet-stream"])
    })), attachmentsTable.rows.add(attachmentRows).draw(), -1 != t.html.indexOf("{{.Tracker}}") ? $("#use_tracker_checkbox").prop("checked", !0) : $("#use_tracker_checkbox").prop("checked", !1)) : $("#templateModalLabel").text("New Template"), $("#attachmentsTable").unbind("click").on("click", "span>i.fa-trash-o", (function() {
        attachmentsTable.row($(this).parents("tr")).remove().draw()
    }))
}

function copy(e) {
    $("#modalSubmit").unbind("click").click((function() {
        save(-1)
    })), $("#attachmentUpload").unbind("click").click((function() {
        this.value = null
    })), $("#html_editor").ckeditor(), $("#attachmentsTable").show(), attachmentsTable = $("#attachmentsTable").DataTable({
        destroy: !0,
        order: [
            [1, "asc"]
        ],
        columnDefs: [{
            orderable: !1,
            targets: "no-sort"
        }, {
            sClass: "datatable_hidden",
            targets: [3, 4]
        }]
    });
    var t = {
        attachments: []
    };
    t = templates[e], $("#name").val("Copy of " + t.name), $("#subject").val(t.subject), $("#envelope-sender").val(t.envelope_sender), $("#html_editor").val(t.html), $("#text_editor").val(t.text), $.each(t.attachments, (function(e, t) {
        var a = icons[t.type] || "fa-file-o";
        attachmentsTable.row.add(['<i class="fa ' + a + '"></i>', escapeHtml(t.name), '<span class="remove-row"><i class="fa fa-trash-o"></i></span>', t.content, t.type || "application/octet-stream"]).draw()
    })), $("#attachmentsTable").unbind("click").on("click", "span>i.fa-trash-o", (function() {
        attachmentsTable.row($(this).parents("tr")).remove().draw()
    })), -1 != t.html.indexOf("{{.Tracker}}") ? $("#use_tracker_checkbox").prop("checked", !0) : $("#use_tracker_checkbox").prop("checked", !1)
}

function importEmail() {
    raw = $("#email_content").val(), convert_links = $("#convert_links_checkbox").prop("checked"), raw ? api.import_email({
        content: raw,
        convert_links: convert_links
    }).success((function(e) {
        $("#text_editor").val(e.text), $("#html_editor").val(e.html), $("#subject").val(e.subject), e.html && (CKEDITOR.instances.html_editor.setMode("wysiwyg"), $('.nav-tabs a[href="#html"]').click()), $("#importEmailModal").modal("hide")
    })).error((function(e) {
        modalError(e.responseJSON.message)
    })) : modalError("No Content Specified!")
}

function load() {
    $("#templateTable").hide(), $("#emptyMessage").hide(), $("#loading").show(), api.templates.get().success((function(e) {
        templates = e, $("#loading").hide(), templates.length > 0 ? ($("#templateTable").show(), templateTable = $("#templateTable").DataTable({
            destroy: !0,
            columnDefs: [{
                orderable: !1,
                targets: "no-sort"
            }]
        }), templateTable.clear(), templateRows = [], $.each(templates, (function(e, t) {
            templateRows.push([escapeHtml(t.name), moment(t.modified_date).format("MMMM Do YYYY, h:mm:ss a"), "<div class='pull-right'><span data-toggle='modal' data-backdrop='static' data-target='#modal'><button class='btn btn-primary' data-toggle='tooltip' data-placement='left' title='Edit Template' onclick='edit(" + e + ")'>                    <i class='fa fa-pencil'></i>                    </button></span>\t\t    <span data-toggle='modal' data-target='#modal'><button class='btn btn-primary' data-toggle='tooltip' data-placement='left' title='Copy Template' onclick='copy(" + e + ")'>                    <i class='fa fa-copy'></i>                    </button></span>                    <button class='btn btn-danger' data-toggle='tooltip' data-placement='left' title='Delete Template' onclick='deleteTemplate(" + e + ")'>                    <i class='fa fa-trash-o'></i>                    </button></div>"])
        })), templateTable.rows.add(templateRows).draw(), $('[data-toggle="tooltip"]').tooltip()) : $("#emptyMessage").show()
    })).error((function() {
        $("#loading").hide(), errorFlash("Error fetching templates")
    }))
}
$(document).ready((function() {
    $(".modal").on("hidden.bs.modal", (function(e) {
        $(this).removeClass("fv-modal-stack"), $("body").data("fv_open_modals", $("body").data("fv_open_modals") - 1)
    })), $(".modal").on("shown.bs.modal", (function(e) {
        void 0 === $("body").data("fv_open_modals") && $("body").data("fv_open_modals", 0), $(this).hasClass("fv-modal-stack") || ($(this).addClass("fv-modal-stack"), $("body").data("fv_open_modals", $("body").data("fv_open_modals") + 1), $(this).css("z-index", 1040 + 10 * $("body").data("fv_open_modals")), $(".modal-backdrop").not(".fv-modal-stack").css("z-index", 1039 + 10 * $("body").data("fv_open_modals")), $(".modal-backdrop").not("fv-modal-stack").addClass("fv-modal-stack"))
    })), $.fn.modal.Constructor.prototype.enforceFocus = function() {
        $(document).off("focusin.bs.modal").on("focusin.bs.modal", $.proxy((function(e) {
            this.$element[0] === e.target || this.$element.has(e.target).length || $(e.target).closest(".cke_dialog, .cke").length || this.$element.trigger("focus")
        }), this))
    }, $(document).on("hidden.bs.modal", ".modal", (function() {
        $(".modal:visible").length && $(document.body).addClass("modal-open")
    })), $("#modal").on("hidden.bs.modal", (function(e) {
        dismiss()
    })), $("#importEmailModal").on("hidden.bs.modal", (function(e) {
        $("#email_content").val("")
    })), CKEDITOR.on("dialogDefinition", (function(e) {
        var t = e.data.name,
            a = e.data.definition;
        "link" == t && (a.minWidth = 500, a.minHeight = 100, a.getContents("info").get("linkType").hidden = !0)
    })), load()
}));