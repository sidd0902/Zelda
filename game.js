
kaboom({
    global: true,
    fullscreen: true,
    scale: 1,
    clearColor: [0,0,0,1]
  })
  
  
  const MOVE_SPEED = 120
  const SLICER_SPEED = 100
  const SKELETOR_SPEED = 60
  
  
  loadSprite('left_pov', 'left_view.png')
  loadSprite('right_pov', 'right_view.png')
  loadSprite('down_pov', 'botm_view.png')
  loadSprite('up_pov', 'top_view.png')
  loadSprite('left-wall', 'lw.png')
  loadSprite('top-wall', 'tw.png')
  loadSprite('bottom-wall', 'bw.png')
  loadSprite('right-wall', 'rw.png')
  loadSprite('bottom-left-wall', 'llw.png')
  loadSprite('bottom-right-wall', 'lrw.png')
  loadSprite('top-left-wall', 'tlw.png')
  loadSprite('top-right-wall', 'trw.jpg')
  loadSprite('top-door', 'td.png')
  loadSprite('left-door', 'ld.png')
  loadSprite('fire-pot', 'firepot.png')
  loadSprite('lanterns', 'lantern.png')
  loadSprite('smoldon', 'smoldon.png')
  loadSprite('skeldon', 'skeldon.png')
  loadSprite('kaboom', 'kaboom.png')
  loadSprite('ladder', 'ladder.png')
  loadSprite('bg', 'backgrnd.png')
  
  scene('game', ({ level, score }) => {
    layers(['bg', 'obj', 'ui'], 'obj')
  
    const maps = [
      [
        'ycc)cc^ccw',
        'a        b',
        'a      * b',
        'a    (   b',
        '%        b',
        'a    (   b',
        'a   *    b',
        'a        b',
        'xdd)dd)ddz',
      ],
      [
        'yccccccccw',
        'a        b',
        ')        )',
        'a        b',
        'a        b',
        'a    $   b',
        ')   }    )',
        'a        b',
        'xddddddddz',
      ],
    ]
  
    const levelCfg = {
      width: 48,
      height: 48,
      a: [sprite('left-wall'), solid(), 'wall'],
      b: [sprite('right-wall'), solid(), 'wall'],
      c: [sprite('top-wall'), solid(), 'wall'],
      d: [sprite('bottom-wall'), solid(), 'wall'],
      w: [sprite('top-right-wall'), solid(), 'wall'],
      x: [sprite('bottom-left-wall'), solid(), 'wall'],
      y: [sprite('top-left-wall'), solid(), 'wall'],
      z: [sprite('bottom-right-wall'), solid(), 'wall'],
      '%': [sprite('left-door'), solid(), 'door'],
      '^': [sprite('top-door'), 'next-level'],
      $: [sprite('ladder'), 'next-level'],
      '*': [sprite('smoldon'), 'smoldon', { dir: -1 }, 'dangerous'],
      '}': [sprite('skeldon'), 'dangerous', 'skeldon', { dir: -1, timer: 0 }],
      ')': [sprite('lanterns'), solid()],
      '(': [sprite('fire-pot'), solid()],
    }
    addLevel(maps[level], levelCfg)
  
    add([sprite('bg'), layer('bg')])
  
    const scoreLabel = add([
      text('0'),
      pos(400, 450),
      layer('ui'),
      {
        value: score,
      },
      scale(2),
    ])
  
    add([text('level ' + parseInt(level + 1)), pos(400, 465), scale(2)])
  
    const player = add([
      sprite('right_pov'),
      pos(5, 190),
      {
        // right by default
        dir: vec2(1, 0),
      },
    ])
  
    player.action(() => {
      player.resolve()
    })
  
    player.overlaps('next-level', () => {
      go('game', {
        level: (level + 1) % maps.length,
        score: scoreLabel.value,
      })
    })
  
    keyDown('left', () => {
      player.changeSprite('left_pov')
      player.move(-MOVE_SPEED, 0)
      player.dir = vec2(-1, 0)
    })
  
    keyDown('right', () => {
      player.changeSprite('right_pov')
      player.move(MOVE_SPEED, 0)
      player.dir = vec2(1, 0)
    })
  
    keyDown('up', () => {
      player.changeSprite('up_pov')
      player.move(0, -MOVE_SPEED)
      player.dir = vec2(0, -1)
    })
  
    keyDown('down', () => {
      player.changeSprite('down_pov')
      player.move(0, MOVE_SPEED)
      player.dir = vec2(0, 1)
    })
  
    function spawnKaboom(p) {
      const obj = add([sprite('kaboom'), pos(p), 'kaboom'])
      wait(1, () => {
        destroy(obj)
      })
    }
  
    keyPress('space', () => {
      spawnKaboom(player.pos.add(player.dir.scale(48)))
    })
  
    player.collides('door', (d) => {
      destroy(d)
    })
  
    collides('kaboom', 'skeldon', (k,s) => {
      camShake(4)
      wait(1, () => {
        destroy(k)
      })
      destroy(s)
      scoreLabel.value++
      scoreLabel.text = scoreLabel.value
    })
  
    action('smoldon', (s) => {
      s.move(s.dir * SLICER_SPEED, 0)
    })
  
    collides('smoldon', 'wall', (s) => {
      s.dir = -s.dir
    })
  
    action('skeldon', (s) => {
      s.move(0, s.dir * SKELETOR_SPEED)
      s.timer -= dt()
      if (s.timer <= 0) {
        s.dir = -s.dir
        s.timer = rand(5)
      }
    })
  
    collides('skeldon', 'wall', (s) => {
      s.dir = -s.dir
    })
  
    player.overlaps('dangerous', () => {
      go('lose', { score: scoreLabel.value })
    })
  })
  
  scene('lose', ({ score }) => {
    add([text(score, 32), origin('center'), pos(width() / 2, height() / 2)])
  })
  
  start('game', { level: 0, score: 0 })