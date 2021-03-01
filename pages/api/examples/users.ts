import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'next-auth/jwt';
import { getSession } from 'next-auth/client';
import { API_URL, CURSUS_ID, CAMPUS_ID } from 'utils/constants'
import { User } from '@interfaces/User';
import { PAGE_SIZE } from '../../../utils/constants'

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

    let page = parseInt(req.query.page as string) || 1;
    if (page < 1) page = 1;
    const size = parseInt(req.query.limit as string) || PAGE_SIZE;

    const endpoint = `${API_URL}/v2/campus/${CAMPUS_ID}/users`;
    const url = endpoint +
      `?sort=-id` +
      `&page[size]=${size}` +
      `&page[number]=${page}`;

    const ftRes = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Bearer ${token.accessToken}`,
      }
    });

    if (ftRes.status !== 200) {
      throw new Error('Failed to fetch API');
    }

    const users: User[] = await ftRes.json();

    res.status(200).json(users);
  } catch (err) {
    res.send({ message: err.message });
  }
}

export default handler;
