export function validarAgente(req, res, next) {
    const { nome, email, senha, elementoParanormal, classe, sanidade } = req.body;

    if (!nome || nome.trim() === '') {
        return res.status(400).json({ erro: 'O nome do Agente é obrigatório' });
    }
    if (nome.length < 3) {
        return res.status(400).json({ erro: 'O nome do Agente deve ter pelo menos 3 caracteres' });
    }
    if (!email || email.trim() === '') {
        return res.status(400).json({ erro: 'O email do Agente é obrigatório' });
    }
    // A senha vira hash antes de ir pro banco, então o tamanho é conferido aqui
    if (!senha || senha.trim().length < 8) {
        return res.status(400).json({ erro: 'A senha do Agente deve ter pelo menos 8 caracteres' });
    }
    if (!elementoParanormal || elementoParanormal !== "Sangue" && elementoParanormal !== "Morte" && elementoParanormal !== "Conhecimento" && elementoParanormal !== "Energia") {
        return res.status(400).json({ erro: 'O elemento paranormal do Agente é obrigatório' });
    }
    if (!classe || classe.trim() === '' || classe !== "Ocultista" && classe !== "Especialista" && classe !== "Combatente") {
        return res.status(400).json({ erro: 'A classe do Agente é obrigatória' });
    }
    if (!sanidade || sanidade != 20) {
        return res.status(400).json({ erro: 'A sanidade do Agente é obrigatoriamente 20.' });
    }
    next();
}