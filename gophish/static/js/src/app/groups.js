var groups = [];

function save(e) {
    var a = [];
    $.each($("#targetsTable").DataTable().rows().data(), (function(e, t) {
        a.push({
            first_name: unescapeHtml(t[0]),
            last_name: unescapeHtml(t[1]),
            email: unescapeHtml(t[2]),
            position: unescapeHtml(t[3])
        })
    }));
    var t = {
        name: $("#name").val(),
        targets: a
    }; - 1 != e ? (t.id = e, api.groupId.put(t).success((function(e) {
        successFlash("Group updated successfully!"), load(), dismiss(), $("#modal").modal("hide")
    })).error((function(e) {
        modalError(e.responseJSON.message)
    }))) : api.groups.post(t).success((function(e) {
        successFlash("Group added successfully!"), load(), dismiss(), $("#modal").modal("hide")
    })).error((function(e) {
        modalError(e.responseJSON.message)
    }))
}

function dismiss() {
    $("#targetsTable").dataTable().DataTable().clear().draw(), $("#name").val(""), $("#modal\\.flashes").empty()
}

function edit(e) {
    if (targets = $("#targetsTable").dataTable({
            destroy: !0,
            columnDefs: [{
                orderable: !1,
                targets: "no-sort"
            }]
        }), $("#modalSubmit").unbind("click").click((function() {
            save(e)
        })), -1 == e) {
        $("#groupModalLabel").text("New Group")
    } else $("#groupModalLabel").text("Edit Group"), api.groupId.get(e).success((function(e) {
        $("#name").val(e.name), targetRows = [], $.each(e.targets, (function(e, a) {
            targetRows.push([escapeHtml(a.first_name), escapeHtml(a.last_name), escapeHtml(a.email), escapeHtml(a.position), '<span style="cursor:pointer;"><i class="fa fa-trash-o"></i></span>'])
        })), targets.DataTable().rows.add(targetRows).draw()
    })).error((function() {
        errorFlash("Error fetching group")
    }));
    $("#csvupload").fileupload({
        url: "/api/import/group",
        dataType: "json",
        beforeSend: function(e) {
            e.setRequestHeader("Authorization", "Bearer " + user.api_key)
        },
        add: function(e, a) {
            $("#modal\\.flashes").empty();
            var t = a.originalFiles[0].name;
            if (t && !/(csv|txt)$/i.test(t.split(".").pop())) return modalError("Unsupported file extension (use .csv or .txt)"), !1;
            a.submit()
        },
        done: function(e, a) {
            $.each(a.result, (function(e, a) {
                addTarget(a.first_name, a.last_name, a.email, a.position)
            })), targets.DataTable().draw()
        }
    })
}
var downloadCSVTemplate = function() {
        var e = "group_template.csv",
            a = Papa.unparse([{
                "First Name": "Example",
                "Last Name": "User",
                Email: "foobar@example.com",
                Position: "Systems Administrator"
            }], {}),
            t = new Blob([a], {
                type: "text/csv;charset=utf-8;"
            });
        if (navigator.msSaveBlob) navigator.msSaveBlob(t, e);
        else {
            var o = window.URL.createObjectURL(t),
                s = document.createElement("a");
            s.href = o, s.setAttribute("download", e), document.body.appendChild(s), s.click(), document.body.removeChild(s)
        }
    },
    deleteGroup = function(e) {
        var a = groups.find((function(a) {
            return a.id === e
        }));
        a && Swal.fire({
            title: "Are you sure?",
            text: "This will delete the group. This can't be undone!",
            type: "warning",
            animation: !1,
            showCancelButton: !0,
            confirmButtonText: "Delete " + escapeHtml(a.name),
            confirmButtonColor: "#428bca",
            reverseButtons: !0,
            allowOutsideClick: !1,
            preConfirm: function() {
                return new Promise((function(a, t) {
                    api.groupId.delete(e).success((function(e) {
                        a()
                    })).error((function(e) {
                        t(e.responseJSON.message)
                    }))
                }))
            }
        }).then((function(e) {
            e.value && Swal.fire("Group Deleted!", "This group has been deleted!", "success"), $('button:contains("OK")').on("click", (function() {
                location.reload()
            }))
        }))
    };

function addTarget(e, a, t, o) {
    var s = escapeHtml(t).toLowerCase(),
        r = [escapeHtml(e), escapeHtml(a), s, escapeHtml(o), '<span style="cursor:pointer;"><i class="fa fa-trash-o"></i></span>'],
        n = targets.DataTable(),
        i = n.column(2, {
            order: "index"
        }).data().indexOf(s);
    i >= 0 ? n.row(i, {
        order: "index"
    }).data(r) : n.row.add(r)
}

function load() {
    $("#groupTable").hide(), $("#emptyMessage").hide(), $("#loading").show(), api.groups.summary().success((function(e) {
        if ($("#loading").hide(), e.total > 0) {
            groups = e.groups, $("#emptyMessage").hide(), $("#groupTable").show();
            var a = $("#groupTable").DataTable({
                destroy: !0,
                columnDefs: [{
                    orderable: !1,
                    targets: "no-sort"
                }]
            });
            a.clear(), groupRows = [], $.each(groups, (function(e, a) {
                groupRows.push([escapeHtml(a.name), escapeHtml(a.num_targets), moment(a.modified_date).format("MMMM Do YYYY, h:mm:ss a"), "<div class='pull-right'><button class='btn btn-primary' data-toggle='modal' data-backdrop='static' data-target='#modal' onclick='edit(" + a.id + ")'>                    <i class='fa fa-pencil'></i>                    </button>                    <button class='btn btn-danger' onclick='deleteGroup(" + a.id + ")'>                    <i class='fa fa-trash-o'></i>                    </button></div>"])
            })), a.rows.add(groupRows).draw()
        } else $("#emptyMessage").show()
    })).error((function() {
        errorFlash("Error fetching groups")
    }))
}
$(document).ready((function() {
    load(), $("#targetForm").submit((function() {
        var e = document.getElementById("targetForm");
        if (e.checkValidity()) return addTarget($("#firstName").val(), $("#lastName").val(), $("#email").val(), $("#position").val()), targets.DataTable().draw(), $("#targetForm>div>input").val(""), $("#firstName").focus(), !1;
        e.reportValidity()
    })), $("#targetsTable").on("click", "span>i.fa-trash-o", (function() {
        targets.DataTable().row($(this).parents("tr")).remove().draw()
    })), $("#modal").on("hide.bs.modal", (function() {
        dismiss()
    })), $("#csv-template").click(downloadCSVTemplate)
}));