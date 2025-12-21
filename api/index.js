export default async (req, res) =>{
    const { reqHandler } = await import('../dist/application-shoppyness/server/server.mjs');
    return reqHandler(req, res);
}