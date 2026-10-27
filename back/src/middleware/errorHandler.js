export function errorHandler(erro, req, res, next) {
    console.error('X ERRO:', erro.message, erro.stack);

    // Erros do Mongoose (dados inválidos ou id mal formatado) são culpa do cliente
    if (erro.name === 'ValidationError' || erro.name === 'CastError') {
        erro.status = 400;
    }

    // Índice unique do Mongo: email repetido
    if (erro.code === 11000) {
        erro.status = 409;
        erro.message = 'Já existe um agente com esse email';
    }

    res.status(erro.status || 500).json({ erro: erro.message || 'Erro interno do servidor' });
}
