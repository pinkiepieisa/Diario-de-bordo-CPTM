import * as migration_20261106_060540_inicial from './20261106_060540_inicial';

export const migrations = [
  {
    up: migration_20261106_060540_inicial.up,
    down: migration_20261106_060540_inicial.down,
    name: '20261106_060540_inicial'
  },
];
