// ==UserScript==
// @name GetCourseAdvanced
// @description Скрипт предназначен для администраторов школ на платформе GetCourse. Добавляет дополнительный функционал.
// @author      Dmitry Space
// @version     2.3.0
// @date        2019-12-19
// @require http://ajax.googleapis.com/ajax/libs/jquery/1.8.0/jquery.min.js
// @require https://cdnjs.cloudflare.com/ajax/libs/blueimp-md5/2.12.0/js/md5.min.js
// @include *://*/*
// ==/UserScript==
/////////////////////////

(function () {
  (function ($) {

    var relativeurl = window.location.pathname + (window.location.href.indexOf("?") == -1 ? "" : "?" + window.location.href.split("?").pop());

    if (relativeurl.indexOf("/pl/user/user") > -1) {

      $("head").append('<link href="https://gitcdn.link/cdn/DmitrySpace/GetCourseAdvanced/8e7be07d5e337111c6f04a09b5bdf5351627483e/styles.css" rel="stylesheet" type="text/css">');

      var admin_id = unsafeWindow.accountUserId;

        $(`<li><a id="usersdelete" href="javascript:void(0)">
          Выгрузить сегмент
        </a></li>
        <li><a id="userssubscribe" href="javascript:void(0)">
          Подписать отписавшихся
        </a></li>
        <li><a id="usersban" href="javascript:void(0)">
          Забанить
        </a></li>
        <li><a id="usersunban" href="javascript:void(0)">
          Вернуть из бана
        </a></li>`).insertAfter("#w0 .btn-group ul.dropdown-menu li:first-child");

        $("#usersdelete").click(function () {
          getCSV().then(function (csv_href) {
            if (csv_href) file_downloaded(csv_href)
          });
        });

        $("#userssubscribe").click(function () {
          var action = function (userid, count_userids, ind) {
            var userlink = "/user/control/user/update/id/" + userid;
            var mailingCategories = new Promise(function (resolve, reject) {
              $.ajax({
                url: userlink,
                success: function (data) {
                  var pageDom = $('<div></div>').append($.parseHTML(data));
                  var ctgs = {};
                  pageDom.find("input[name^='mailingCategories']").each(function (index) {
                    ctgs[$(this).attr("name")] = 1; //ПОДПИСКА
                  });
                  resolve(ctgs);
                }
              });
            });
            mailingCategories.then(function (categories) {
              console.log(categories);
              $.post(
                userlink,
                Object.assign(
                  categories, {
                    "action": "save",
                    "save": "Сохранить",
                    "User[type]": "user",
                    "User[subscribe_status]": "all",
                    rule: `{"type":"usersrule","inverted":0,"className":"app::modules::user::models::rule::UsersRule","params":{"ids":["${userid}"]}}`
                  }
                ),
                function (data) {
                  $("#gcextcode div").width((((ind + 1) * 100) / count_userids) + "%");
                  if ((ind + 1) === count_userids) {
                    $("#gcextcode span").html("Подписка возобновлена");
                    location.reload();
                  } else $("#gcextcode span").html("Подписка: " + (ind + 1) + " / " + count_userids);
                }
              );
            });
          };
          getCSV().then(function (csv_href) {
            if (csv_href) users_universal(csv_href, action)
          });
        });

        $("#usersban").click(function () {
          var action = function (userid, count_userids, ind) {
            $.post(
              "/user/control/user/update/id/" + userid, {
                "action": "ban",
                "User[type]": "user",
                "User[subscribe_status]": "all",
                rule: `{"type":"usersrule","inverted":0,"className":"app::modules::user::models::rule::UsersRule","params":{"ids":["${userid}"]}}`
              },
              function (data) {
                $("#gcextcode div").width((((ind + 1) * 100) / count_userids) + "%");
                if ((ind + 1) === count_userids) {
                  $("#gcextcode span").html("Пользователи забанены");
                  location.reload();
                } else $("#gcextcode span").html("Бан: " + (ind + 1) + " / " + count_userids);
              }
            );
          };
          getCSV().then(function (csv_href) {
            if (csv_href) users_universal(csv_href, action)
          });
        });

        $("#usersunban").click(function () {
          var action = function (userid, count_userids, ind) {
            $.post(
              "/user/control/user/update/id/" + userid, {
                "action": "unban",
                "User[type]": "user",
                "User[subscribe_status]": "all",
                rule: `{"type":"usersrule","inverted":0,"className":"app::modules::user::models::rule::UsersRule","params":{"ids":["${userid}"]}}`
              },
              function (data) {
                $("#gcextcode div").width((((ind + 1) * 100) / count_userids) + "%");
                if ((ind + 1) === count_userids) {
                  $("#gcextcode span").html("Пользователи разбанены");
                  location.reload();
                } else $("#gcextcode span").html("Возврат из бана: " + (ind + 1) + " / " + count_userids);
              }
            );
          };
          getCSV().then(function (csv_href) {
            if (csv_href) users_universal(csv_href, action)
          });
        });

        function getCSV() {
          var csv_href = false;
          var promise = new Promise(function (resolve, reject) {
            $("body").append(`
           <div id="gcextcode">
             <span>Загрузка списка...</span>
             <div></div>
             <button class="btn btn-danger" onclick="location.reload(); return false;">Отмена</button>
           </div>
        `);
            $.ajax({
              type: "POST",
              url: "/pl/export/add-task",
              data: {
                segmentId: "",
                rule: $('input[name="uc[rule_string]"]').val(),
                export_format: "msoffice",
                context_name: "UserContext",
                operation_type: "user_exporttocsv",
                execute: "Запустить"
              },
              complete: function () {
                $.ajax({
                  url: "/pl/logic/operation/prepare?contextType=UserContext&operationType=user_exporttocsv",
                  success: function (data) {
                    var exportpageDom = $('<div></div>').append($.parseHTML(data));
                    var taskid = exportpageDom.find('.export-in-progress').first().data('id');
                    var maxrepeat = 180;
                    checkExport(taskid);

                    function checkExport(taskid) {
                      if (--maxrepeat) {
                        window.setTimeout(function () {
                          $.ajax({
                            dataType: "json",
                            url: "/pl/export/check-task?exportTaskId=" + taskid,
                            success: function (response) {
                              if (response.data.complete) {
                                csv_href = '/pl/export/download?exportTaskId=' + taskid;
                                resolve(csv_href);
                                $("#gcextcode span").html("Список загружен");
                              } else checkExport(taskid);
                            },
                            error: function (jqXHR, textStatus, errorThrown) {
                              console.log(textStatus, errorThrown);
                              checkExport(taskid);
                            }
                          });
                        }, 1000);
                      } else error("getusers");
                    }
                  }
                });
              }
            });
          });
          return promise;
        }


        function file_downloaded(fileurl) {
          $.ajax({
            url: fileurl,
            success: function (response) {
              fetch(fileurl)
                .then(resp => resp.blob())
                .then(blob => {
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.style.display = 'none';
                  a.href = url;
                  var datetime = new Date().toLocaleString('en-GB').replace(/\//g, ".").replace(/,/g, "");
                  a.download = 'userbase[' + datetime + '].csv';
                  document.body.appendChild(a);
                  a.click();
                  window.URL.revokeObjectURL(url);
                  usersdeleting(fileurl);
                })
                .catch(() => error("getusers"));
            },
            error: function (jqXHR, textStatus, errorThrown) {
              console.log(textStatus, errorThrown);
              error("getusers");
            }
          });
        }

        function usersdeleting(csv_href) {
          $.get(csv_href, function (data) {
            let parsedata = [];
            let newLinebrk = data.split("\n");
            var userid = "";
            for (let i = 1; i < newLinebrk.length; i++) {
              userid = newLinebrk[i].split(";")[0];
              if (userid.match(/[0-9]+/)) parsedata.push(userid);
            }
            console.log(parsedata);
            if (confirm("" + parsedata.length + " чел. в очереди на удаление.\nПеред продолжением убедись, что файл CSV скачан.\n\nНачать удаление?")) {
              for (let i = 0; i < parsedata.length; i++) {
                if (parsedata[i] != admin_id) {
                  (function (ind) {
                    setTimeout(function () {
                      $.post(
                        "/user/control/user/delete/id/" + parsedata[i], {
                          do_delete: ""
                        },
                        function (data) {
                          $("#gcextcode div").width((((ind + 1) * 100) / parsedata.length) + "%");
                          if ((ind + 1) === parsedata.length) {
                            $("#gcextcode span").html("Удаление завершено");
                            location.reload();
                          } else $("#gcextcodee span").html("Удаление: " + (ind + 1) + " / " + parsedata.length);
                        }
                      );
                    }, 2000 * ind);
                  })(i);
                }
              }
            } else $("#gcextcode").remove();
          });
        }

        function users_universal(csv_href, action) {
          $.get(csv_href, function (data) {
            let parsedata = [];
            let newLinebrk = data.split("\n");
            var userid = "";
            for (let i = 1; i < newLinebrk.length; i++) {
              userid = newLinebrk[i].split(";")[0];
              if (userid.match(/[0-9]+/)) parsedata.push(userid);
            }
            console.log(parsedata);
            for (let i = 0; i < parsedata.length; i++) {
              if (parsedata[i] != admin_id) {
                (function (ind) {
                  setTimeout(action(parsedata[i], parsedata.length, ind), 500 * ind);
                })(i);
              }
            }
          });
        }

        function error(type) {
          if (type == "getusers") {
            alert("Ошибка при загрузке списка пользователей.\nПродолжение невозможно.");
            $("#gcextcode").remove();
          }
        }

    }
  }(jQuery))
})(window);
