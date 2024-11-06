export async function waitForTotalsInformation(page) {
    await page.waitForResponse(
        async (response) => {
            return response.url().includes('totals-information') && response.status() === 200;
        }
    );
}

export async function waitForInitApiCall(page) {
    await page.waitForResponse(
        async (response) => {
            return response.url().includes('express/init') && response.status() === 200;
        }
    );
}
