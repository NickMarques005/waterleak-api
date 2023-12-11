//handleGoalCreation.js
const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Goal = require('../models/goal_data');
const jwt = require('jsonwebtoken');
const goal_data = require('../models/goal_data');

//Chave principal para assinar os tokens JWT.
const jwt_mainKey = require('../config').jwt_key;

router.post("/createGoal", async (req,res) => {
    try{
        //Recebimentos dos dados da requisição no aplicativo
        const token = req.header('Authorization').replace('Bearer ', '');
        const { newGoal } = req.body;

        console.log("NEW GOAL: ", newGoal);
        console.log("TOKEN: ", token);

        if(!token || !newGoal)
        {
            return res.status(400).json({ message: "Houve um erro no envio dos dados da Meta"});
        }

        //Decodificação do token:
        const decodedToken = jwt.verify(token, jwt_mainKey);
        console.log("TOKEN DECODIFICADO: ", decodedToken);

        const user = await User.findById(decodedToken.user.id);

        //Verifica se o usuário está registrado no banco de dados
        if(!user){
            return res.status(404).json({message: "Usuário não encontrado"});
        }

        //Verificação se existe o documento do usuário registrado na coleção de metas
        const userGoal = await Goal.findOne({userID: decodedToken.user.id});

        if(userGoal)
        {
            //Se existir um documento do usuário adiciona a nova meta no array goals
            userGoal.goals.push(newGoal);

            //Salvamento das metas atualizadas
            await userGoal.save();
            return res.status(200).json({ success: true, message: "Meta adicionada com sucesso!"});
        }
        else {
            //Se não existir criar novo documento
            const newGoalData = new Goal({
                userID: decodedToken.user.id,
                goals: [newGoal],
            });

            //Adiciona novo documento ao banco de dados
            await newGoalData.save();

            return res.status(200).json({ success: true, message: "Meta e novo documento adicionado com sucesso!"});
        }
    }
    catch (err)
    {
        //Caso de algum erro envie ao console para depuração
        console.error("Erro: ", err);
        return res.status(500).json({ message: "Houve um erro no servidor" });
    }
});

router.post('/updateGoal', async (req, res) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '');
        if(!token)
        {
            return res.status(400).json({ message: 'Token não fornecido.'});
        }

        const decodedToken = jwt.verify(token, jwt_mainKey);
        const userGoal = await Goal.findOne({userID: decodedToken.user.id});

        if(!userGoal) {
            return res.status(404).json({ message: "Id não encontrado"});
        }

        const { goalIndex , updatedGoal } = req.body;

        if(goalIndex == undefined || !updatedGoal)
        {
            return res.status(400).json({ message: "Parâmetros da meta a ser atualizada inválidos"});
        }

        if(goalIndex < 0 || goalIndex >= userGoal.goals.length)
        {
            return res.status(400).json({ message: "Índice de meta inválido"});
        }

        console.log("GOAL INDEX: ", goalIndex);
        console.log("GOAL UPDATED: ", updatedGoal);
        console.log("GOALS USER: ", userGoal.goals);
        
        //Atualiza a nova meta no array de metas do usuário
        userGoal.goals.splice(goalIndex, 1, updatedGoal);

        await userGoal.save();

        return res.status(200).json({ message: "Meta atualizada com sucesso"});
    }
    catch (err)
    {
        console.error("Erro ao atualizar meta: ", err);
        return res.status(500).json({ message: "Houve um problema no servidor."});
    }
});

router.post('/deleteGoal', async (req, res) => {
    try{
        const token = req.header('Authorization').replace('Bearer ', '');

        if(!token)
        {
            return res.status(400).json({ message: 'Token não fornecido.'});
        }

        const decodedToken = jwt.verify(token, jwt_mainKey);
        const userGoal = await Goal.findOne({userID: decodedToken.user.id});

        if(!userGoal){
            return res.status(404).json({ message: "Usuário não encontrado!"});
        }

        const { goalIndex } = req.body;

        //Verificação se o dado do goalIndex é válido
        if(goalIndex == undefined)
        {
            return res.status(400).json({ message: "ID da meta não encontrado"});
        }

        if(goalIndex < 0 || goalIndex >= userGoal.goals.length)
        {
            return res.status(400).json({ message: "Índice de meta inválido"});
        }

        //Remove meta especifica a partir do índice no array
        userGoal.goals.splice(goalIndex, 1);
    
        await userGoal.save();

        return res.status(200).json({ message: "Meta excluída com sucesso!"});
    }
    catch (err)
    {
        console.error("Erro ao obter dados das metas: ", err);
        return res.status(500).json({ message: "Houve um problema no servidor."});
    }
});

router.post('/getGoals', async (req, res) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '');

        if(!token)
        {
            return res.status(400).json({ message: 'Token não fornecido.'});
        }

        const decodedToken = jwt.verify(token, jwt_mainKey);
        const user_id = await Goal.findOne({userID: decodedToken.user.id});

        if(!user_id){
            return res.status(404).json({ message: "Usuário não encontrado!"});
        }

        if(user_id.goals)
        {
            const goalsData = user_id.goals;
            console.log("Metas a serem enviadas: ", goalsData);
            return res.status(200).json({success: true, goals_data: goalsData});
        }
        else{
            console.log("Não há metas");
            return res.status(200).json({success: true, goals_data: null});
        }
    }
    catch (err) {
        console.error("Erro ao obter dados das metas: ", err);
        return res.status(500).json({ message: "Houve um problema no servidor."});
    }
});

module.exports = router;



