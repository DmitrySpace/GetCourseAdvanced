// ==UserScript==
// @name UsersRemoving for GC
// @description Удаляет пользователей по сегменту
// @author      Dmitry Space
// @version     1.0
// @date        2019-11-11
// @require http://ajax.googleapis.com/ajax/libs/jquery/1.8.0/jquery.min.js
// @require https://cdnjs.cloudflare.com/ajax/libs/tabletop.js/1.5.1/tabletop.min.js
// @require https://cdnjs.cloudflare.com/ajax/libs/blueimp-md5/2.12.0/js/md5.min.js
// @include *://*/*
// ==/UserScript==
/////////////////////////

var style = `
<style>
#usersdeletecode {
    position: fixed;
    left: 50%;
    top: 50%;
    margin-top: -50px;
    margin-left: -200px;
    text-align: left;
    width: 400px;
    color: black;
    text-decoration: none;
    display: block;
    padding: 20px;
    z-index: 10000;
}
#usersdeletecode:after {
  content: '';
  position:absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  background: #fff;
  box-shadow: 0 5px 20px #00000066;
}
#usersdeletecode::before {
    content: " ";
    position: fixed;
    top: 0;
    right: 0;
    width: 100%;
    height: 100%;
    background-color: #000000;
    z-index: -2;
    opacity: 0.3;
}
#usersdeletecode span {
    display: inline-block;
    position: relative;
    margin-bottom: 15px;
    font-weight: 200;
}
#usersdeletecode div {
    width: 1%;
    height: 20px;
    position: relative;
    margin: 0 0 20px 0;
    z-index: 1;
}
#usersdeletecode div:before {
  content: " ";
  position:absolute;
  width: 360px;
  height: 20px;
  background-color: #ece5e5;
  z-index: -2;
}
#usersdeletecode div:after {
    content: " ";
    position:absolute;
    width: 100%;
    height: 100%;
    background-color: #f19c9c;
    position: absolute;
    z-index: -1;
}
#usersdeletecode .btn {
    border-radius: 0;
    margin-left: auto;
    position: relative;
    display: block;
    right: 0;
}
</style>
`;


(function () {(function($) {

  var admin_id = unsafeWindow.accountUserId;
  var relativeurl = window.location.pathname + (window.location.href.indexOf("?") == -1 ? "" : "?"+window.location.href.split("?").pop());

  /* СТРАНИЦА ПОЛЬЗОВАТЕЛЕЙ */
  if (relativeurl.indexOf("/pl/user/user") > -1 ) {

      Tabletop.init({
        key: "https://docs.google.com/spreadsheets/d/1CZ0TNkXMtw39VoOP2zQ4CEJKdXZeiMzckx6dXw_hcY8/edit?usp=sharing",
        callback: function(data){
           var allow = false;
           $.each( data, function(i, hash) {
              if(hash.hashes == md5(admin_id+"4226")) {
                allow = true;
                main();
              } else if (i+1 == data.length && !allow) {
                alert("Ошибка: Нет доступа.\nДля устранения проблемы напишите в телеграм @DmitrySpace");
              }
           })
        },
        error: function(){alert("Ошибка при авторизации\nДля устранения проблемы напишите в телеграм @DmitrySpace")},
        simpleSheet: true
      });

function main() {
     $(`<li>
          <a id="usersdelete" href="javascript:void(0)">Выгрузить сегмент</a>
        </li>`).insertAfter("#w0 .btn-group ul.dropdown-menu li:first-child");
     $("#usersdelete").click(function() {
        $("body").append(`
           <div id="usersdeletecode">
             <span>Загрузка списка...</span>
             <div></div>
             <button class="btn btn-danger" onclick="location.reload(); return false;">Отмена</button>
           </div>
        ` + style);
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
          complete: function() {
            $.ajax({
             url: "/pl/logic/operation/prepare?contextType=UserContext&operationType=user_exporttocsv",
             success: function(data) {
               var exportpageDom = $('<div></div>').append($.parseHTML(data));
               var taskid = exportpageDom.find('.export-in-progress').first().data('id');
               var maxrepeat = 30;
               checkExport(taskid);
               function checkExport(taskid) {
                if(--maxrepeat){
			     setTimeout( function() {
                   $.ajax({
                     dataType : "json",
                     url: "/pl/export/check-task?exportTaskId=" + taskid,
                     success: function(response) {
				  	   if (response.data.complete) {
						 var csv_href = '/pl/export/download?exportTaskId=' + taskid;
                         file_downloaded(csv_href);
					   } else checkExport(taskid);
			         },
                     error: function(jqXHR, textStatus, errorThrown) {
                       console.log(textStatus, errorThrown);
                       checkExport(taskid);
                     }
                   });
			    }, 1000 );
               } else usersdeleting();
              }
            }
          });
        }
      });
    });


function file_downloaded(fileurl) {
 $.ajax({
   url: fileurl,
   success: function(response) {
     fetch(fileurl)
       .then(resp => resp.blob())
       .then(blob => {
         const url = window.URL.createObjectURL(blob);
         const a = document.createElement('a');
         a.style.display = 'none';
         a.href = url;
         var datetime = new Date().toLocaleString('en-GB').replace(/\//g, ".").replace(/,/g, "");
         a.download = 'userbase['+datetime+'].csv';
         document.body.appendChild(a);
         a.click();
         window.URL.revokeObjectURL(url);
         usersdeleting(fileurl);
       })
       .catch(() => usersdeleting());
   },
   error: function(jqXHR, textStatus, errorThrown) {
     console.log(textStatus, errorThrown);
     usersdeleting();
   }
 });
}

function usersdeleting(csv_href = false) {
  if(csv_href){
                        $("#usersdeletecode span").html( "Список загружен" );
                         $.get( csv_href, function( data ) {
                           let parsedata = [];
                           let newLinebrk = data.split("\n");
                           var userid = "";
                           for(let i = 1; i < newLinebrk.length; i++) {
                             userid = newLinebrk[i].split(";")[0];
                             if(userid.match(/[0-9]+/)) parsedata.push(userid);
                           } console.log(parsedata);
                           if(confirm(""+parsedata.length+" чел. в очереди на удаление.\nПеред продолжением убедись, что файл CSV скачан.\n\nНачать удаление?")){
                             for (let i = 0; i < parsedata.length; i++) {
                               if(parsedata[i] != admin_id) {
                                 (function(ind) {
                                   setTimeout(function(){
                                     $.post(
                                       "/user/control/user/delete/id/"+parsedata[i],
                                       {do_delete : ""}, function(data) {
                                          $("#usersdeletecode div").width((((ind+1)*100)/parsedata.length)+"%");
                                          if ((ind+1) === parsedata.length) {
                                              $("#usersdeletecode span").html("Удаление завершено");
                                              location.reload();
                                          }
                                          else $("#usersdeletecode span").html("Удаление: "+ (ind+1) +" / "+ parsedata.length );
                                       }
                                     );
                                   }, 300*ind);
                                 })(i);
                               }
                             }
                           } else $("#usersdeletecode").remove();
                         });
  } else {
    alert("Ошибка при загрузке списка пользователей.\nПродолжение невозможно.");
    $("#usersdeletecode").remove();
  }
}
}
}

}(jQuery))})(window);