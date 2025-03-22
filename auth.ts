import {
	NextApiRequest,
	NextApiResponse,
	GetServerSidePropsContext,
} from 'next';
import { getServerSession } from 'next-auth';
import { config } from './lib/config/next-auth-config';
export function auth(
	...args:
		| [GetServerSidePropsContext['req'], GetServerSidePropsContext['res']]
		| [NextApiRequest, NextApiResponse]
		| []
) {
	return getServerSession(...args, config);
}
