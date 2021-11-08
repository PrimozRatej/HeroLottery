const socket = io('ws://localhost:8080');

/* socket.on('bet', data => {
    const el = document.createElement('li');
    el.innerHTML = data;
    document.querySelector('#scores > ul').appendChild(el)
}); */

document.querySelector('button').onclick = () => {
    const name = document.querySelector('#input-name').value;
    const number = document.querySelector('#input-number').value;
    socket.emit('bet', name, number);
}

socket.on('datetime', data => {
    var date = new Date(data);
    setTime(date);
    setSeconds(date);
});

socket.on('raffle_score', winRaffles => {
    console.log('get raffle_score');
    var ulist = document.querySelector('#scores > ul');
    ulist.innerHTML = '';
    winRaffles.forEach(scoreObj => {
        const el = document.createElement('li');
        el.innerHTML = '';
        var usersStr = '';
        scoreObj.users.length !== 0 ? 
        scoreObj.users.forEach(user => {
            usersStr += user?.name
        }) : 
        usersStr += 'No lucy contestants 😭'
        usersStr +=`#${scoreObj.raffle.lottery_number}`;
        el.innerHTML = usersStr;
        document.querySelector('#scores > ul').appendChild(el)
    });
});

function setTime(date) {
    const now = new Date(date);
    let h = now.getHours();
    let m = now.getMinutes();
    let s = now.getSeconds();
    m = checkTime(m);
    s = checkTime(s);
    document.querySelector('#clock').innerHTML = h + ":" + m + ":" + s;
    console.log("date" + date);
}

function setSeconds(date) {
    var now = new Date(date);
    var tillNext30s = new Date(date);
    if (now.getSeconds() < 30) tillNext30s.setSeconds(30);
    else {
        tillNext30s.setMinutes(tillNext30s.getMinutes() + 1);
        tillNext30s.setSeconds(00);
    }

    var dif = now.getTime() - tillNext30s.getTime();
    var sec = dif / 1000;
    var rouSec = Math.abs(sec);

    document.querySelector('#next-raffle').innerHTML = `New winner in ${rouSec}s`;
    console.log("rouSec" + rouSec);
}

function checkTime(i) {
    if (i < 10) { i = "0" + i };  // add zero in front of numbers < 10
    return i;
}