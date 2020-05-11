//CONSTANTS
//other
const PIXEL_SCALE = 3
const DATA_PATH = "resources/"
const MAP_PATH = "maps/"
const DEBUG = true
const PI = Math.PI

//physics
const GRAVITY = 1000
const TIME_BOOSTER = 1 //WARNING!!!

//arrays
const PRESSED_KEYS = new Array(128)
const ONCE_PRESSED_KEYS = new Set()
const LIFELESSES = []
const BACKGROUNDS = []
const ALIVES = []
const TEXTURE_LIST = new Map()

/*
//alive states
const STATE_STAY
//*/

//animation states

const ANIMATION_STATE_STAY = 0
const ANIMATION_STATE_FALL = 1
const ANIMATION_STATE_WALK = 2
const ANIMATION_STATE_RUN = 3

const ANIMATION_STATE_JUMP_READY = 4
const ANIMATION_STATE_JUMP = 5
const ANIMATION_STATE_JUMP_END = 6

const ANIMATION_STATE_SITING = 7
const ANIMATION_STATE_SEAT = 8
const ANIMATION_STATE_CROUCH = 9
const ANIMATION_STATE_UPING = 10

//block types
const TYPE_BOX = 0
const TYPE_CIRCLE = 1
const TYPE_TRIANGLE_LEFT_UP = 2
const TYPE_TRIANGLE_RIGHT_UP = 3
const TYPE_TRIANGLE_RIGHT_DOWN = 4
const TYPE_TRIANGLE_LEFT_DOWN = 5


//keycodes
const KEY_SPACE = 32
const KEY_LEFT = 37
const KEY_UP = 38
const KEY_RIGHT = 39
const KEY_DOWN = 40
const KEY_A = 65
const KEY_B = 66
const KEY_C = 67
const KEY_D = 68
const KEY_E = 69
const KEY_F = 70
const KEY_G = 71
const KEY_H = 72
const KEY_I = 73
const KEY_J = 74
const KEY_K = 75
const KEY_L = 76
const KEY_M = 77
const KEY_N = 78
const KEY_O = 79
const KEY_P = 80
const KEY_Q = 81
const KEY_R = 82
const KEY_S = 83
const KEY_T = 84
const KEY_U = 85
const KEY_V = 86
const KEY_W = 87
const KEY_X = 88
const KEY_Y = 89
const KEY_Z = 90
