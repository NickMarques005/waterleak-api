//---createUser.js---//

const express = require('express');
const router = express.Router();
const user = require('../models/user');
const {body, validationResult } = require('express-validator');

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

//Chave principal para assinar os tokens JWT.
const jwt_mainKey = require('../config').jwt_key;
console.log("KEY ALEATORIA PRINCIPAL: ",jwt_mainKey);

//Rota de Método POST para criação do Usuário

router.post('/createuser',
    body('email').isEmail(),
    body('name').isLength({min: 3}),
    body('password', 'Incorrect Password').isLength({min: 8}),
    async (req, res) => {
        //Extrai os erros dos resultados possíveis da requisição
        const errors = validationResult(req);

        //Caso haja erros na requisição então retornará os erros
        if(!errors.isEmpty())
        {
            return res.status(400).json({errors: errors.array()});
        }

        const salt_generation = await bcrypt.genSalt(10);
        let hashedPassword = await bcrypt.hash(req.body.password, salt_generation);
    
        try{
            await user.create({
                name: req.body.name,
                email: req.body.email,
                password: hashedPassword,
                telefone: req.body.telefone,
            });
            //Se a info estiver correta, irá retornar a resposta em json {success: true}
            console.log("Conta do usuário criada com sucesso!");
            return res.json({success: true});
        }
        catch (err)
        {
            //Se caso der um erro no processo, irá retornar {success: false}
            console.log(err);
            return res.json({success: false});
        }
    }
);

//Rota de Método POST para Login de usuário

router.post('/loginuser',
    body('email').isEmail(),
    body('password', 'Incorrect Password').isLength({min: 8}),
    async (req, res) => {
        //Extrai os erros dos resultados possíveis da requisição
        const errors = validationResult(req);

        //Caso haja erros na requisição então retornará os erros
        if(!errors.isEmpty())
        {
            return res.status(400).json({ errors: errors.array()});
        }

        let email = req.body.email;
        let password = req.body.password;

        try{
            //Função async await para achar o usuário através do email soclicitado
            let user_data = await user.findOne({email});

            //Se não achar o e-mail portanto o usuário não existe ainda no banco de dados
            if(!user_data)
            {
                return res.status(400).json({errors: "Email não encontrado"});
            }

            //Função async await para comparar as senhas de Login com a senha do usuário registrado
            const password_compare = await bcrypt.compare(password, user_data.password)

            //Se as senhas não forem iguais portanto a senha é incorreta
            if(!password_compare)
            {
                return res.status(400).json({errors: 'Senha incorreta'});
            }

            const data_authentication = {
                user: {
                    id: user_data.id
                }
            }

            //Token de autenticação
            const authToken = jwt.sign(data_authentication, jwt_mainKey);
            console.log("Conta de usuário encontrada! Dados do usuário:\nEmail: ", user_data.email, "\nSenha: ", user_data.password, "\nNome: ", user_data.name, "\nTel: ", user_data.telefone);
            console.log("ID: ", user_data.id)
            res.json({success: true, authToken: authToken, userId: user_data.id, email: user_data.email, name: user_data.name});
        }
        catch(err)
        {   
            //Caso o processo de algum problema será printado o erro
            console.log(err);
            res.json({success: false});
        }
    }
);

module.exports = router;