import { Component } from '@angular/core';

type CellValue = '' | 'X' | 'O';

/**
 * Represents a single cell on the board.
 */
export class Cell {
  value: '' | 'X' | 'O' = '';

  constructor(value: '' | 'X' | 'O' = '') {
    this.value = value;
  }
}

/**
 * Represents a player with a symbol ('X' or 'O') and how many pieces
 * that player has placed on the board.
 */
export class Player {
  symbol: 'X' | 'O';
  count: number;

  constructor(symbol: 'X' | 'O', count = 0) {
    this.symbol = symbol;
    this.count = count;
  }
}

@Component({
  standalone:false,
  selector: 'app-game',
  templateUrl: './game.page.html',
  styleUrls: ['./game.page.scss'],
})
export class GamePage {
  board: Cell[][] = [
    [new Cell(), new Cell(), new Cell()],
    [new Cell(), new Cell(), new Cell()],
    [new Cell(), new Cell(), new Cell()],
  ];

  // We’ll create two Player objects for X and O.
  xPlayer: Player = new Player('X');
  oPlayer: Player = new Player('O');

  // Track the current player by a reference to one of the two above
  currentPlayer: Player = this.xPlayer;

  // For a quick reference, we can keep track of a “winner” symbol
  winner: 'X' | 'O' | '' = '';

  // A message displayed in the UI
  message: string = '';

  // For piece-moving feature: store selected cell position (row/col)
  selectedCell: { row: number; col: number } | null = null;

  /**
   * Called when user clicks on a cell in the UI (see game.page.html).
   */
  onCellClick(rowIndex: number, colIndex: number) {
    // If someone already won, ignore clicks
    if (this.winner) {
      return;
    }

    

    // If we have a selected cell, attempt to move (instead of place)
    if (this.selectedCell) {
      this.handleMove(rowIndex, colIndex);
      return;
    }
    // Check if current player has < 3 pieces
    else if (this.currentPlayer.count >= 3) {
    
        
        this.onSelectPiece(rowIndex,colIndex);
        
    }
    else
    {

        // Otherwise, handle placing a piece if the player hasn't placed all 3
        this.handlePlace(rowIndex, colIndex);
    }
  }

  /**
   * Places a piece if the current player has < 3 pieces on the board
   * and the cell is empty.
   */
  private handlePlace(rowIndex: number, colIndex: number) {
    // cell already occupied?
    if (this.board[rowIndex][colIndex].value !== '') {
      return;
    }

    // Current player's symbol
    const symbol = this.currentPlayer.symbol;

    // Check if current player has < 3 pieces
    if (this.currentPlayer.count < 3) {
      // Place the piece
      this.board[rowIndex][colIndex].value = symbol;
      this.currentPlayer.count++;
      // Check for winner
      this.checkWinner();

      // Switch player if no winner yet
      if (!this.winner) {
        this.switchPlayer();
      }
      
    }
    
    
  }

  /**
   * Once a player has 3 pieces on the board, they must move an
   * already-placed piece to an empty cell.
   *
   * - If user clicks one of their own pieces while nothing is selected,
   *   we store that cell as `selectedCell`.
   * - If user then clicks an empty cell, move the piece to that cell.
   */
  private handleMove(rowIndex: number, colIndex: number) {
    // The cell that was previously selected
    const { row, col } = this.selectedCell!;

    // If the user clicks on another one of their pieces, change selection
    if (
      this.board[rowIndex][colIndex].value === this.currentPlayer.symbol &&
      (rowIndex !== row || colIndex !== col)
    ) {
      this.selectedCell = { row: rowIndex, col: colIndex };
      return;
    }

    // If the clicked cell is empty, proceed to move
    if (this.board[rowIndex][colIndex].value === '') {
      // Move piece
      this.board[rowIndex][colIndex].value = this.board[row][col].value;
      this.board[row][col].value = '';

      // Clear selection
      this.selectedCell = null;

      // Check for winner
      this.checkWinner();

      // Switch player if no winner
      if (!this.winner) {
        this.switchPlayer();
      }
    }
  }

  /**
   * Allows the user to select one of their existing pieces to move.
   * (Useful if you have a separate "Select" button. Alternatively,
   * you can just use onCellClick to handle everything.)
   */
  onSelectPiece(rowIndex: number, colIndex: number) {
    // Only allow selection if it's the current player's piece
    if (this.board[rowIndex][colIndex].value === this.currentPlayer.symbol) {
      this.selectedCell = { row: rowIndex, col: colIndex };
    }
  }

  /**
   * Check all winning lines for 3 in a row.
   */
  private checkWinner() {
    const lines = this.getLines();
    for (let line of lines) {
      if (
        line[0] !== '' &&
        line[0] === line[1] &&
        line[1] === line[2]
      ) {
        this.winner = line[0] as 'X' | 'O';
        this.message = `Player ${this.winner} wins!`;
        return;
      }
    }
    // No winner yet
    //this.message = `It's ${this.currentPlayer.symbol}'s turn.`;
  }

  /**
   * Helper to get all rows/columns/diagonals.
   */
  private getLines(): Array<[CellValue, CellValue, CellValue]> {
    return [
      // Rows
      [
        this.board[0][0].value,
        this.board[0][1].value,
        this.board[0][2].value
      ],
      [
        this.board[1][0].value,
        this.board[1][1].value,
        this.board[1][2].value
      ],
      [
        this.board[2][0].value,
        this.board[2][1].value,
        this.board[2][2].value
      ],
  
      // Columns
      [
        this.board[0][0].value,
        this.board[1][0].value,
        this.board[2][0].value
      ],
      [
        this.board[0][1].value,
        this.board[1][1].value,
        this.board[2][1].value
      ],
      [
        this.board[0][2].value,
        this.board[1][2].value,
        this.board[2][2].value
      ],
  
      // Diagonals
      [
        this.board[0][0].value,
        this.board[1][1].value,
        this.board[2][2].value
      ],
      [
        this.board[0][2].value,
        this.board[1][1].value,
        this.board[2][0].value
      ],
    ];
  }

  /**
   * Switch the current player from X to O or O to X.
   */
  private switchPlayer() {
    this.currentPlayer =
      this.currentPlayer.symbol === 'X' ? this.oPlayer : this.xPlayer;
  }

  /**
   * Reset the game to its initial state.
   */
  resetGame() {
    // Clear the board
    this.board = [
      [new Cell(), new Cell(), new Cell()],
      [new Cell(), new Cell(), new Cell()],
      [new Cell(), new Cell(), new Cell()],
    ];

    // Reset players
    this.xPlayer.count = 0;
    this.oPlayer.count = 0;

    // X always starts
    this.currentPlayer = this.xPlayer;

    // Clear winner & messages
    this.winner = '';
    this.message = '';
    this.selectedCell = null;
  }
}
