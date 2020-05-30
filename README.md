# GetCourseAdvanced
Это UserScript, который добавляет дополнительный функционал в админскую часть платформы GetCourse.

![](https://github.com/DmitrySpace/GetCourseAdvanced/raw/master/img/gca.png)

## Установка

### 1. Установка расширения
Для запуска скрипта необходимо установить расширение для браузера - **Tampermonkey**

[Скачать Tampermonkey](https://tampermonkey.net/)\
По ссылке выше также есть видеоинструкция по установке

### 2. Подключение скрипта

1. [Откройте скрипт](https://github.com/DmitrySpace/GetCourseAdvanced/raw/master/GetCourseAdvanced.user.js)
2. Нажмите на кнопку «Установить»
3. Скрипт установлен

#### Обновление скрипта
Процесс обновления скрипта полностью идентичен процессу установки, но в большинстве случаев обновление проиходит автоматически, требуется только подтвердить установку обновления.

## Использование
Рассмотрим использование скрипта на примере удаления пользователей.

![](https://github.com/DmitrySpace/GetCourseAdvanced/raw/master/img/userdeletion.gif)

**1. Перейдите на страницу "Пользователи"**

![Открываем страницу "Пользователи"](https://i.imgur.com/erD9ycv.png)
 \
 \
**2. Выберите сегмент, который хотите выгрузить и удалить, или просто сделайте "новую выборку".**\
:exclamation: Будьте внимательны и осторожны
  
![Выбираем сегмент](https://i.imgur.com/WuCSnwr.png)
 \
 \
**3. Пройдитесь по списку, и убедитесь, что в нем нет лишних людей**  

**4. Нажимите на кнопку "Действия" и в появившемся списке выберите "Выгрузить сегмент"**

![](https://i.imgur.com/80ivfuO.png)
 \
 \
**5. Дождитесь загрузки CSV-списка.**
- *Откройте его и проверьте, что это действительно выбранные пользователи.*
- *Убедитесь, что количество человек в появившемся окне совпадает с тем количеством, которое показано на странице  GetCourse после выборки.*

![](https://i.imgur.com/Urdagvx.png)
 \
 \
**6. Если вы хотите удалить выбранных людей из своего GetCourse-акканта, то жмите "OK"**\
Начнётся процесс удаления, после которого страница перезагрузится, а в выборке будет сказано:\
*Под правило попадает: 0 пользователей*

#### Другие функции работают по анаглогии, нужно лишь выбрать соответствующий пункт в меню "Действия"


#### Внимание! Администрация геткурса настоятельно просит НЕ использовать этот скрипт. Но если уж вы используете его, тогда делайте выборку пользователей по-меньше, и лучше производить эти действия в ночное время, когда нагрузка на сервера не так высока. GetCourse оставляет за собой право заблокировать аккаунт, из-за слишком большого количества запросов к серверу. Поэтому помните, что вы пользуетесь этим скриптом исключительно на свой страх и риск. 

#### Если возникнут проблемы напишите об этом [здесь](https://github.com/DmitrySpace/GetCourseAdvanced/issues) или в телеграм [@DmitrySpace](https://tlgg.ru/DmitrySpace)
