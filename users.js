const users = []

const addUser = ({id,username,room}) => {
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    if(!username || !room){
        return {
            error : "UserName and Room are required!!"
        }
    }

    const existinguser = users.find(user => {
        return user.room === room && user.username === username
    })

    if(existinguser){
        return {
            error : 'User already exists in Database!'
        }
    }
    
    const user = { id , username , room}
    users.push(user)

    return {
        user : user
    }
}

const removeUser = (id) => {
    const index = users.findIndex(user => user.id == id)
    return users.splice(index,1)[0]
}

const getUser = (id) => {    
    return users.find(user => user.id == id)
}

const getUserInRoom = (room) => {
    room = room.trim().toLowerCase()
    return users.filter(user => user.room == room)
}

module.exports = {
    getUser,
    addUser,
    removeUser,
    getUserInRoom
}