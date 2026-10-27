export function notFound(req, res, next) {
    res.status(404).json({ error: 'Rota não encontrada', caminho: req.url });
}