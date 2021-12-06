var socket = io('ws://server:3001', { path: '/socket.io'});

document.querySelector('button').onclick = () => {
    const user = document.querySelector('#input-name').value;
    const userSelectedNumber = document.querySelector('#input-number').value;
    socket.emit('bet', { user, userSelectedNumber });
}

document.querySelector('#popup-div').onclick = () => {
    var popup = document.getElementById("popupId");
    popup.classList.replace('show', 'hide')
}

socket.on('datetime', data => {
    var date = new Date(data);
    setTime(date);
    setSeconds(date);
});

socket.on('score', winRaffles => {
    var ulist = document.querySelector('#scores > ul');
    ulist.innerHTML = '';
    winRaffles.forEach(scoreObj => {
        const el = document.createElement('li');
        el.innerHTML = '';
        var usersStr = '';
        scoreObj.users.length !== 0 ?
            scoreObj.users.forEach(user => {
                usersStr += user?.name
                if(user !== scoreObj.users[scoreObj.users.length-1]) usersStr += ', '
            }) :
            usersStr += 'No lucy contestants 😭'
        usersStr += `<span style="float:right; padding-right: 10%;">#${scoreObj.raffle.lottery_number}</span>`;
        el.innerHTML = usersStr;
        document.querySelector('#scores > ul').appendChild(el)
    });
});

socket.on('validation', validator => {

    if (validator == null) showPopUp('👍 Good luck', '#90ee90');
    else {
        var validationTxt = '';
        validator.validations.forEach(validation => {
            if (!validation.isValid) {
                validationTxt += validation.message + '<br>'
            }
        });
        showPopUp(validationTxt, '#ffcccb');
    }

});


function setTime(date) {
    const now = new Date(date);
    let h = now.getHours();
    let m = now.getMinutes();
    let s = now.getSeconds();
    m = checkTime(m);
    s = checkTime(s);
    document.querySelector('#clock').innerHTML = h + ":" + m + ":" + s;
}

function setSeconds(date) {
    var now = new Date(date);
    var nextRaffleDate = new Date(date);
    // Calculate the date the next raffle will be at
    if (now.getSeconds() < 30) nextRaffleDate.setSeconds(30)
    else {
        nextRaffleDate.setMinutes(nextRaffleDate.getMinutes() + 1)
        nextRaffleDate.setSeconds(00);
    }
    var dif = now.getTime() - nextRaffleDate.getTime();
    // Get time in sec and round it up
    var sec = dif / 1000;
    var rouSec = Math.abs(sec);
    document.querySelector('#next-raffle').innerHTML = `New winner in ${rouSec}s`;
}

function checkTime(i) {
    if (i < 10) { i = "0" + i };  // add zero in front of numbers < 10
    return i;
}

function showPopUp(msg, color) {
    var popup = document.getElementById("popupId");
    popup.innerHTML = msg;
    popup.style.backgroundColor = color;
    setTimeout(function () {
        popup.classList.replace('show', 'hide')
    }, 4000);
    popup.classList.replace('hide', 'show');
}