import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'next-auth/jwt';
import { getSession } from 'next-auth/client';
import { API_URL } from 'utils/constants'
const secret = process.env.SECRET;

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const session = await getSession({ req });
    if (!session) {
      throw new Error('You must be signed in to view the protected content on this page.')
    }

    const token = await jwt.getToken({ req, secret });
    if (!token) {
      throw new Error('JWT token is not available.');
    }

    const name = (req.query.name as string) || "test";
    const url = `${API_URL}/v2/users/${name}`;
    console.log(url);

    const ftRes = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Bearer ${token.accessToken}`,
      }
    });

    console.log(ftRes.status);
    if (ftRes.status !== 200) {
      throw new Error('Failed to fetch API');
    }

    const json = await ftRes.json();
    res.send(JSON.stringify(json, null, 2));
  } catch (err) {
    res.send({ message: err.message });
  }
}

export default handler;
