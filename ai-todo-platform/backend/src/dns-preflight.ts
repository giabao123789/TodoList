/**
 * Run before Mongoose connects. Helps some Windows / IPv6-heavy networks reach Atlas.
 * Does not fix corporate firewalls that block DNS SRV or outbound 27017.
 */
import { setDefaultResultOrder } from 'node:dns';

setDefaultResultOrder('ipv4first');
