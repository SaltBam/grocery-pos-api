import { ClientSession, Connection } from 'mongoose';

export async function runInTransaction<T>(
    fn: (session: ClientSession) => Promise<T>,
    connection: Connection,
    session?: ClientSession,
): Promise<T> {
    const ownSession = !session;

    if (ownSession) {
        session = await connection.startSession();
        session.startTransaction();
    }
    session = session as ClientSession;

    try {
        const result = await fn(session);

        if (ownSession) await session.commitTransaction();

        return result;
    } catch (err) {
        if (ownSession) await session.abortTransaction();

        throw err;
    } finally {
        if (ownSession) await session.endSession();
    }
}
