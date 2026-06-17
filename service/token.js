const   Jwt = require('jsonwebtoken')

module.exports =  function generateJWTToken(userId, fullname, role){
  const accessToken = Jwt.sign({userId, fullname, role}, 'ElbekPHD6791-0.0.1', {expiresIn: '30d'})
  return accessToken
}

