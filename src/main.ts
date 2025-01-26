import {Game} from "./Game.ts";
import {DBService} from "./DBService.ts";
import {HighScore} from "./types.ts";
import {LeaderBoard} from "./LeaderBoard.ts";

const canvas: HTMLCanvasElement = document.querySelector("canvas") as HTMLCanvasElement;
const ctx: CanvasRenderingContext2D = canvas.getContext("2d") as CanvasRenderingContext2D;
const scoreElement: HTMLSpanElement = document.querySelector("#score") as HTMLSpanElement;
const highScoreElement: HTMLSpanElement = document.querySelector("#high-score") as HTMLSpanElement;
const leaderboardElement: HTMLUListElement = document.querySelector("#leaderboard-list") as HTMLUListElement;

const leaderBoard = new LeaderBoard(leaderboardElement);
const dbService = new DBService(leaderBoard);
dbService.listenForChanges()

const game = new Game(canvas, ctx, scoreElement, highScoreElement, dbService);
game.start();
