const themeselect = document.getElementById("theme-select")
if (getCookie('theme')) {
    themeselect.value = getCookie('theme')
    theme = themeselect.value
}else{
    theme='Default'

}
setsound()
themeselect.onchange = function () {
    createCookie('theme', [this.value])
    var link = document.createElement("link");
    link.href = '/css/' + this.value + '/started.css'
    link.type = "text/css";
    link.rel = "stylesheet";
    document.getElementsByTagName("html")[0].appendChild(link);
    theme = this.value
    setsound()
}

var url = new URL(window.location.href)
var key = url.searchParams.get("key")
CheckKey(key).then(res => {
    if (res) {
        StartSniper()
    } else {
        eraseCookie('key')
        window.location.replace("/")
    }
})

function setsound(){
    sadd=new Audio('/sounds/' + theme + '/add.mp3')
    sconnect=new Audio('/sounds/' + theme + '/connect.mp3')
    sdisconnect=new Audio('/sounds/' + theme + '/disconnect.mp3')
    sjoin=new Audio('/sounds/' + theme + '/join.mp3')
    sleave=new Audio('/sounds/' + theme + '/leave.mp3')
    sremove=new Audio('/sounds/' + theme + '/remove.mp3')
}

if (getCookie('snipes')) {  //Set Snipes
    var snipescookie = getCookie('snipes')
    var snipes = JSON.parse(snipescookie)
} else {
    var snipes = {
        'Arosity': {
            uuid: '9c13cae91f344386a5a857dace6d765d'
        },
        'Wimk': {
            uuid: "8c1a7e32c5a342a29a103ff338a853f3",
        }
    }
    createCookie('snipes', JSON.stringify(snipes))
}

const table = document.getElementById("usertable")
const userinput = document.getElementById('userinput')
const responset = document.getElementById('responset')
userinput.addEventListener('keyup', UserInputFunction)
soundenabled = false

cleannames = {}
var chr = new XMLHttpRequest()
chr.onreadystatechange = (e) => {
    if (chr.readyState === 4) {
        cleannames = JSON.parse(chr.responseText)
    }
}; chr.open("GET", "/json/clean.json"); chr.send()

for (var ign in snipes) {
    addrow({
        name: ign,
        uuid: snipes[ign]['uuid'],
    })
}

async function StartSniper(key) {
    while (Object.keys(snipes).length > 0) {
        for (var ign in snipes) {
            await getUSER(ign).then(res => {
                game = '---'
                mode = '---'
                map = '---'
                if (res == false) {
                    return
                }
                session = res["session"]

                if (session['online'] == false) {
                    color = 'offline'
                    return
                }
                color = 'lobby'

                sgametype = session['gameType']
                smode = session['mode']
                smap = session['map']


                game = cleannames[sgametype]['clean']


                if (smode == 'LOBBY') {
                    color = 'lobby'
                    mode = 'Lobby'
                    return
                }
                
                try{
                    mode = cleannames[sgametype]['modes'][smode]['clean']
                    if (!cleannames[sgametype]['modes'][smode]['nomap']) {
                        map = smap
                    }
    
                    color = 'online'
                }catch(err){
                    console.log(sgametype+"     "+smode+"   "+smap)
                }
            })
            editrow(ign, game, mode, map, color)
            await sleep(505)
        }
    }
}

function addrow(values) {

    snipes[values['name']] = {}
    snipes[values['name']].uuid = values['uuid']
    if (Object.keys(snipes).length == 1) {
        StartSniper(key)
    }
    var json_str = JSON.stringify(snipes)
    createCookie('snipes', json_str)

    var row = table.insertRow(-1)
    row.id = values['name']
    var cell1 = row.insertCell(0)
    var cell2 = row.insertCell(1)
    var cell3 = row.insertCell(2)
    var cell4 = row.insertCell(3)
    var cell5 = row.insertCell(4)

    cell1.innerHTML = "<button class='close-btn' onclick=removerow(this) id='closebutton'> X </button>"
    cell1.classList.add('close-th')

    cell2.innerHTML = values['name']
    cell2.classList.add('ign')
    cell2.id = 'nothing'

    cell3.innerHTML = "---"
    cell3.classList.add('game')
    cell3.id = 'nothing'

    cell4.innerHTML = "---"
    cell4.classList.add('mode')
    cell4.id = 'nothing'

    cell5.innerHTML = "---"
    cell5.classList.add('map')
    cell5.id = 'nothing'
    if (soundenabled) {
        sadd.play()
    }

}

function removerow(value) {
    var num = value.parentNode.parentNode.rowIndex
    table.deleteRow(num)
    delete snipes[value.parentNode.parentNode.id]
    createCookie('snipes', JSON.stringify(snipes))
    if (soundenabled) {
        sremove.play()
    }
}

async function editrow(ign, sgame, smode, smap, scolor) {

    if (document.getElementById(ign)) {


        row = document.getElementById(ign)
        ign = row.getElementsByClassName('ign')[0]
        game = row.getElementsByClassName('game')[0]
        mode = row.getElementsByClassName('mode')[0]
        map = row.getElementsByClassName('map')[0]

        play = true
        if (map.id == "nothing") {
            play = false
        } else {
            paststatus = map.id
        }


        if (game.innerHTML.toString() != sgame.toString()) {
            change = true
        } else if (mode.innerHTML.toString() != smode.toString()) {
            change = true
        } else if (map.id != scolor.toString()) {
            change = true
        } else {
            change = false
        }

        if (change == true) {
            game.innerHTML = sgame
            mode.innerHTML = smode
            map.innerHTML = smap

            game.id = scolor
            mode.id = scolor
            map.id = scolor
            ign.id = scolor

            if (soundenabled) {
                if (play) {
                    if (paststatus == "offline") {
                        sconnect.play()
                    } else if (scolor == "offline") {
                        sdisconnect.play()
                    } else if (scolor == "online") {
                        sjoin.play()
                    } else if (scolor == "lobby") {
                        if (paststatus == "online") {
                            sleave.play()
                        }
                    }
                }
            }
            change = false
        }
    }
}

async function UserInputFunction(e) {
    if (e.keyCode === 13) {
        document.getElementById('userinput').disabled = true
        user = e.target.value
        if (/^[0-9a-zA-Z_]*$/.test(user)) {
            if (!JSON.stringify(snipes).toLowerCase().includes('"' + user.toLowerCase() + '"')) {

                if (user.length >= 3) {
                    await getUUID(user).then(res => {
                        if (res) {

                            addrow({
                                name: res['username'],
                                uuid: res['uuid'],
                            })
                            e.target.value = ""

                        } else {
                            console.log(user + " was not found")
                        }
                    })
                } else {
                    console.log("That username is to short")
                }

            } else {
                console.log(user + " already exists")
            }
        } else {
            console.log("Invalid name")
        }
        document.getElementById('userinput').disabled = false
    }
}

async function getUSER(num) {
    uuid = snipes[num]["uuid"]

    var xhr = new XMLHttpRequest()
    return new Promise((resolve, reject) => {
        xhr.onreadystatechange = (e) => {
            if (xhr.readyState === 4) {
                a = JSON.parse(xhr.responseText)
                if (a['success'] == false) {
                    if (a['cause'] == 'Invalid API key') {
                        eraseCookie('key')
                        window.location.replace("/")
                    } else if (a['cause'] == 'Key throttle') {
                        console.log('Key throttle')
                    }
                } else {
                    resolve(a)
                }

            }
        }
        xhr.open("POST", "https://api.hypixel.net/status?key=" + key + "&uuid=" + uuid)
        xhr.send()
    })
}

async function getUUID(user) {
    var xhr = new XMLHttpRequest()
    return new Promise((resolve, reject) => {
        xhr.onreadystatechange = (e) => {
            if (xhr.readyState === 4) {
                if (xhr.status != 404) {
                    a = JSON.parse(xhr.responseText)
                    resolve(a)
                } else {
                    resolve(false)
                }

            }
        }
        xhr.open("POST", "https://api.ashcon.app/mojang/v2/user/" + user)
        xhr.send()
    })
}

function CheckKey(e) {
    var xhr = new XMLHttpRequest()
    return new Promise((resolve, reject) => {
        xhr.onreadystatechange = (e) => {
            if (xhr.readyState === 4) {
                a = JSON.parse(xhr.responseText)
                if (a.success) {
                    resolve(true)
                } else {
                    resolve(false)
                }
            }
        }
        xhr.open("POST", "https://api.hypixel.net/key?key=" + e)
        xhr.send()
    })
}

function createCookie(name, value, days) {
    var expires;
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toGMTString();
    }
    else {
        expires = "";
    }
    document.cookie = name + "=" + value + expires + "; path=/";
}

function getCookie(c_name) {
    if (document.cookie.length > 0) {
        c_start = document.cookie.indexOf(c_name + "=");
        if (c_start != -1) {
            c_start = c_start + c_name.length + 1;
            c_end = document.cookie.indexOf(";", c_start);
            if (c_end == -1) {
                c_end = document.cookie.length;
            }
            return unescape(document.cookie.substring(c_start, c_end));
        }
    }
    return "";
}

function eraseCookie(name) {
    document.cookie = name + '= Max-Age=-99999999'
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

const soundbox = document.getElementById("soundbox")

soundbox.addEventListener('change', (event) => {
    soundenabled = event.currentTarget.checked
})