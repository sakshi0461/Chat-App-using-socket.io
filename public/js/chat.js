const socket = io()
const $messageForm = document.querySelector('#msg')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendlocationButton = document.querySelector('#send-location')
const $text = document.querySelector('#message')
const $user_in_room = document.querySelector('#sidebar')


const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML


const { username , room } = Qs.parse(location.search, {ignoreQueryPrefix : true})

const autoscroll = () => {
    const $newmessage = $text.lastElementChild
    const newMsgStyles = getComputedStyle($newmessage)
    const newMsgMargin = parseInt(newMsgStyles.marginBottom)
    const newMsgHeight = $newmessage.offsetHeight + newMsgMargin
    const visibleHeight = $text.offsetHeight
    const containerHeight = $text.scrollHeight
    const scrollOffset = $text.scrollTop + visibleHeight

    if(containerHeight - newMsgHeight <= scrollOffset){
        $text.scrollTop = $text.scrollHeight
    }
}


socket.on('message' , (msg) => {
    console.log(msg)
    
    const html = Mustache.render(messageTemplate , {
        username : msg.username,
        newmsg : msg.text,
        createdAt : moment(msg.createdAt).format('h:mm a')
    })
    $text.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('Locationsharing', (msg) => {
   console.log(msg)

   const html = Mustache.render(locationTemplate, {
       username : msg.username,
       url : msg.url,
       createdAt : moment(msg.createdAt).format('h:mm a') 
   })
   $text.insertAdjacentHTML('beforeend',html)
   autoscroll()
}, (msg) => {
   console.log(msg)
})

socket.on('roomData', ({ room , users}) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    $user_in_room.innerHTML = html
})

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()
    const msg = e.target.elements.message.value

    $messageFormButton.setAttribute('disabled','disabled')

    socket.emit('Send',msg, (error) => {
        $messageFormInput.value = ''
        $messageFormInput.focus()

        if(error){
            return console.log(error)
        }

        $messageFormButton.removeAttribute('disabled')

        console.log('Message Delivered!')
    })
})

$sendlocationButton.addEventListener('click', (e) => {
    e.preventDefault()
    if(!navigator.geolocation){
        return alert('Getting location is not supported in your browser!!')
    }
    
    $sendlocationButton.setAttribute('disabled','disabled')

    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('send-location',{
            lat:position.coords.latitude,
            lon:position.coords.longitude
        }, (msg) => {
            console.log(msg)
            $sendlocationButton.removeAttribute('disabled')
        })
    })
})


socket.emit('join', {username,room} , (error) => {
    if(error){
        alert(error)
        location.href = '/'
    }
})