import { Schema, type } from '@colyseus/schema';

export class Player extends Schema {
  @type('string')
  id: string = '';

  @type('string')
  username: string = '';

  @type('number')
  x: number = 0;

  @type('number')
  y: number = 0;

  @type('number')
  health: number = 100;

  @type('number')
  level: number = 1;
}
