import { test, expect } from '@playwright/test';

test.describe('Poker Game End-to-End Test', () => {
  test('should simulate a full hand and save it to history', async ({ page }) => {
    // 1. Navigate to the application's home page.
    await page.goto('/');

    // Ensure the game starts in a clean state
    await page.getByRole('button', { name: 'Start a New Hand' }).click();

    // 2. Simulate the pre-flop betting round.
    // We will click 'call' for all players until the river.
    let currentPlayerTurn = await page.getByText(/Current Player:/).textContent();
    let actionButtons = page.getByTestId('action-buttons');
    
    while(currentPlayerTurn && !currentPlayerTurn.includes('Hand is complete')) {
      const callButton = actionButtons.getByRole('button', { name: /Call/ });
      const checkButton = actionButtons.getByRole('button', { name: 'Check' });
      const foldButton = actionButtons.getByRole('button', { name: 'Fold' });

      if (await callButton.isEnabled()) {
        await callButton.click();
      } else if (await checkButton.isEnabled()) {
        await checkButton.click();
      } else if (await foldButton.isEnabled()) {
        await foldButton.click();
      } else {
        // We might be on a bet or raise turn, so let's just fold to simplify.
        await page.getByRole('button', { name: 'Fold' }).click();
      }
      
      // Give the UI some time to update for the next player
      await page.waitForTimeout(500); 
      currentPlayerTurn = await page.getByText(/Current Player:/).textContent();
    }
    
    // 3. Verify the game log contains entries.
    const gameLog = page.getByText(/Game Log/);
    await expect(gameLog).toContainText('Hand is complete');
    
    // 4. Verify that a new hand history entry has been created.
    const handHistoryList = page.locator('ul.space-y-2');
    await expect(handHistoryList).toContainText(/Hand ID:/);
    await expect(handHistoryList).toContainText(/Starting Stacks:/);
    await expect(handHistoryList).toContainText(/Winnings\/Losses:/);
  });
});
