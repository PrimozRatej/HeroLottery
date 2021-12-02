import org.openqa.selenium.By;
import org.openqa.selenium.TimeoutException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.support.ui.ExpectedCondition;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.FluentWait;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.NoSuchElementException;

import org.junit.Test;

public class STestCeltraLoterry {

    public boolean userBetRaffle(WebDriver driver, WebDriverWait wait, String name, Integer number, Boolean checkSucc) {
        driver.findElement(By.xpath("//*[@id=\"input-name\"]")).sendKeys(name);
        driver.findElement(By.xpath("//*[@id=\"input-number\"]")).sendKeys(number.toString());
        driver.findElement(By.xpath("//*[@id=\"input-form\"]/div/div[2]/button")).click();
        driver.findElement(By.xpath("//*[@id=\"input-name\"]")).clear();
        driver.findElement(By.xpath("//*[@id=\"input-number\"]")).clear();
        if (checkSucc) {
            Boolean isSuc = false;
            try {
                isSuc = wait.until(new ExpectedCondition<Boolean>() {
                    public Boolean apply(WebDriver driver) {
                        WebElement popup = driver.findElement(By.xpath("//*[@id=\"popupId\"]"));
                        String atrClass = popup.getAttribute("class");
                        String atrInnerHtml = popup.getAttribute("innerHTML");
                        if (atrClass.contains("show") && atrInnerHtml.contains("Good luck"))
                            return true;
                        else
                            return false;
                    }
                });
            } catch (TimeoutException e) {
                return false;
            }
            return isSuc;
        } else
            return true;
    }

    /*
     * public boolean userBetRaffle(WebDriver driver, WebDriverWait wait, String
     * name, Integer number) {
     * driver.findElement(By.xpath("//*[@id=\"input-name\"]")).sendKeys(name);
     * driver.findElement(By.xpath("//*[@id=\"input-number\"]")).sendKeys(number.
     * toString());
     * driver.findElement(By.xpath("//*[@id=\"input-form\"]/div/div[2]/button")).
     * click();
     * driver.findElement(By.xpath("//*[@id=\"input-name\"]")).clear();
     * driver.findElement(By.xpath("//*[@id=\"input-number\"]")).clear();
     * Boolean isSuc = false;
     * try {
     * isSuc = wait.until(new ExpectedCondition<Boolean>() {
     * public Boolean apply(WebDriver driver) {
     * WebElement popup = driver.findElement(By.xpath("//*[@id=\"popupId\"]"));
     * String atrClass = popup.getAttribute("class");
     * String atrInnerHtml = popup.getAttribute("innerHTML");
     * if (atrClass.contains("show") && atrInnerHtml.contains("Good luck"))
     * return true;
     * else
     * return false;
     * }
     * });
     * } catch (TimeoutException e) {
     * return false;
     * }
     * return isSuc;
     * }
     */

    public static boolean stringContainsItemFromList(String inputStr, String[] items) {
        return Arrays.stream(items).anyMatch(inputStr::contains);
    }

    @Test
    public void Add_user_to_current_raffle() throws Exception {
        System.setProperty("webdriver.chrome.driver",
                "C:\\Users\\primo\\dev\\HeroLottery\\test\\WebTest\\chromedriver.exe");
        // Headless mode to true.. so there isn't any ui
        ChromeOptions options = new ChromeOptions();
        options.setHeadless(true);
        WebDriver driver = new ChromeDriver(options);

        WebDriverWait wait = new WebDriverWait(driver, 5);
        driver.get("http://127.0.0.1:5500/web/index.html");

        if (userBetRaffle(driver, wait, "Tom", 5, true)) {
            driver.quit();
            return;
        } else {
            driver.quit();
            throw new Exception("ERROR: User couldn't raffle.");
        }
    }

    @Test
    public void User_bet_on_same_raffle_twice_is_not_posible() throws Exception {
        System.setProperty("webdriver.chrome.driver",
                "C:\\Users\\primo\\dev\\HeroLottery\\test\\WebTest\\chromedriver.exe");
        ChromeOptions options = new ChromeOptions();
        options.setHeadless(true);

        WebDriver driver1 = new ChromeDriver(options);
        WebDriverWait wait1 = new WebDriverWait(driver1, 5);

        WebDriver driver2 = new ChromeDriver(options);
        WebDriverWait wait2 = new WebDriverWait(driver2, 5);

        driver1.get("http://127.0.0.1:5500/web/index.html");
        if (userBetRaffle(driver1, wait1, "Nick", 5, true)) {
            driver1.quit();
        } else {
            driver1.quit();
            try {
                throw new Exception("ERROR: User couldn't raffle.");
            } catch (Exception e) {
                e.printStackTrace();
            }
        }

        driver2.get("http://127.0.0.1:5500/web/index.html");
        if (userBetRaffle(driver2, wait2, "Nick", 5, true)) {
            driver2.quit();
            throw new Exception("ERROR: User shouldn't  be able to raffle.");
        } else {
            driver2.quit();
            return;
        }
    }

    @Test
    public void Define_one_winner() throws Exception {
        System.setProperty("webdriver.chrome.driver",
                "C:\\Users\\primo\\dev\\HeroLottery\\test\\WebTest\\chromedriver.exe");
        ChromeOptions options = new ChromeOptions();
        /* options.setHeadless(true); */

        WebDriver driver = new ChromeDriver(options);
        WebDriverWait wait = new WebDriverWait(driver, 32);

        class UserRaffle {
            String name;
            Integer number;

            UserRaffle(String name, Integer number) {
                this.name = name;
                this.number = number;
            }
        }
        // Define all combinations for winner
        List<UserRaffle> usersList = new ArrayList<>();
        driver.get("http://127.0.0.1:5500/web/index.html");

        for (Integer i = 1; i <= 30; i++) {
            usersList.add(new UserRaffle("UserThatBet_" + i, i));
        }

        // Wait for new raffle to start
        FluentWait<WebDriver> fluentWaitForFreshRaffle = new FluentWait<>(driver)
                .withTimeout(Duration.ofSeconds(30))
                .pollingEvery(Duration.ofMillis(200))
                .ignoring(NoSuchElementException.class);

        Boolean isFreshRaffle = fluentWaitForFreshRaffle
                .until(ExpectedConditions.textToBe(By.xpath("//*[@id=\"next-raffle\"]"), "New winner in 25s"));

        if (isFreshRaffle) {
            for (UserRaffle userRaffle : usersList) {
                userBetRaffle(driver, wait, userRaffle.name, userRaffle.number, false);
            }
        } else {
            throw new Exception("ERROR: Something went wrong when betting with defined users");
        }

        FluentWait<WebDriver> fluentWaitForNewRaffle = new FluentWait<>(driver)
                .withTimeout(Duration.ofSeconds(30))
                .pollingEvery(Duration.ofMillis(200))
                .ignoring(NoSuchElementException.class);

        Boolean isNewRaffle = fluentWaitForNewRaffle
                .until(ExpectedConditions.textToBe(By.xpath("//*[@id=\"next-raffle\"]"), "New winner in 28s"));

        // Check if any one of the users was selected as winner. It should be just one.
        if (isNewRaffle) {
            // Get first line of the <ul>
            WebElement winnersEl = driver.findElement(By.xpath("//*[@id=\"scores\"]/ul/li[1]"));
            WebElement raffledNumberEl = driver.findElement(By.xpath("//*[@id=\"scores\"]/ul/li[1]/span"));
            String winnersUlInnerHtml = winnersEl.getAttribute("innerHTML");
            String InningNUmberStr = raffledNumberEl.getAttribute("innerHTML");
            InningNUmberStr = InningNUmberStr.replace("#", "");
            Integer winningNumber = Integer.parseInt(InningNUmberStr);
            Integer pTo = winnersUlInnerHtml.lastIndexOf("<span style=");
            String result = winnersUlInnerHtml.substring(0, pTo);
            String[] usernames = result.split(", ");
            for (UserRaffle userRaffle : usersList) {
                if (userRaffle.number == winningNumber) {
                    boolean userContainCorrectNumber = Arrays.stream(usernames).anyMatch(userRaffle.name::equals);
                    if (!userContainCorrectNumber) {
                        driver.quit();
                        throw new Exception("ERROR: User does not contain correct number");
                    }

                }

            }
            System.out.println(winnersUlInnerHtml);

        } else {
            driver.quit();
            throw new Exception("ERROR: Something went wrong when waiting for new raffle");
        }
    }

    @Test
    public void Define_2_winners() throws Exception {
        Define_winner(2);
        /* System.setProperty("webdriver.chrome.driver",
                "C:\\Users\\primo\\dev\\HeroLottery\\test\\WebTest\\chromedriver.exe");
        ChromeOptions options = new ChromeOptions(); */
        /* options.setHeadless(true); */

       /*  WebDriver driver = new ChromeDriver(options);
        WebDriverWait wait = new WebDriverWait(driver, 32);

        class UserRaffle {
            String name;
            Integer number;

            UserRaffle(String name, Integer number) {
                this.name = name;
                this.number = number;
            }
        } */
        // Define all combinations for winner
       /*  List<UserRaffle> usersList = new ArrayList<>();
        driver.get("http://127.0.0.1:5500/web/index.html");

        for (Integer x = 0; x <= 1; x++) {
            for (Integer i = 1; i <= 30; i++) {
                usersList.add(new UserRaffle("UserThatBet_" + x + "_" + i, i));
            }
        } */

        // Wait for new raffle to start
        /* FluentWait<WebDriver> fluentWaitForFreshRaffle = new FluentWait<>(driver)
                .withTimeout(Duration.ofSeconds(30))
                .pollingEvery(Duration.ofMillis(200))
                .ignoring(NoSuchElementException.class);

        Boolean isFreshRaffle = fluentWaitForFreshRaffle
                .until(ExpectedConditions.textToBe(By.xpath("//*[@id=\"next-raffle\"]"), "New winner in 25s"));

        if (isFreshRaffle) {
            for (UserRaffle userRaffle : usersList) {
                userBetRaffle(driver, wait, userRaffle.name, userRaffle.number, false);
            }
        } else {
            driver.quit();
            throw new Exception("ERROR: Something went wrong when betting with defined users");
        }

        FluentWait<WebDriver> fluentWaitForNewRaffle = new FluentWait<>(driver)
                .withTimeout(Duration.ofSeconds(30))
                .pollingEvery(Duration.ofMillis(200))
                .ignoring(NoSuchElementException.class);

        Boolean isNewRaffle = fluentWaitForNewRaffle
                .until(ExpectedConditions.textToBe(By.xpath("//*[@id=\"next-raffle\"]"), "New winner in 28s"));
 */
        // Check if any one of the users was selected as winner. It should be just one.
        /* if (isNewRaffle) {
            // Get first line of the <ul>
            WebElement winnersEl = driver.findElement(By.xpath("//*[@id=\"scores\"]/ul/li[1]"));
            WebElement raffledNumberEl = driver.findElement(By.xpath("//*[@id=\"scores\"]/ul/li[1]/span"));
            String winnersUlInnerHtml = winnersEl.getAttribute("innerHTML");
            String InningNUmberStr = raffledNumberEl.getAttribute("innerHTML");
            InningNUmberStr = InningNUmberStr.replace("#", "");
            Integer winningNumber = Integer.parseInt(InningNUmberStr);
            Integer pTo = winnersUlInnerHtml.lastIndexOf("<span style=");
            String result = winnersUlInnerHtml.substring(0, pTo);
            String[] usernames = result.split(", ");
            Integer countWinners = 0;
            for (UserRaffle userRaffle : usersList) {
                if (userRaffle.number == winningNumber) {
                    boolean userContainCorrectNumber = Arrays.stream(usernames).anyMatch(userRaffle.name::equals);
                    if (!userContainCorrectNumber)
                        throw new Exception("ERROR: User does not contain correct number");
                    else
                        countWinners++;
                }
            }
            if (countWinners != 2) {
                driver.quit();
                throw new Exception(
                        "ERROR: There were more than 2 winners difinned in this test case, should be just 2. it is "
                                + countWinners);
            }

        } else {
            driver.quit();
            throw new Exception("ERROR: Something went wrong when waiting for new raffle");
        } */
    }

    public void Define_winner(Integer numOfWinnersToCreate) throws Exception {
        System.setProperty("webdriver.chrome.driver",
                "C:\\Users\\primo\\dev\\HeroLottery\\test\\WebTest\\chromedriver.exe");
        ChromeOptions options = new ChromeOptions();
        /* options.setHeadless(true); */

        WebDriver driver = new ChromeDriver(options);
        WebDriverWait wait = new WebDriverWait(driver, 32);

        class UserRaffle {
            String name;
            Integer number;

            UserRaffle(String name, Integer number) {
                this.name = name;
                this.number = number;
            }
        }
        // Define all combinations for winner
        List<UserRaffle> usersList = new ArrayList<>();
        driver.get("http://127.0.0.1:5500/web/index.html");
        if(numOfWinnersToCreate == 1){
            for (Integer i = 1; i <= 30; i++) {
                usersList.add(new UserRaffle("UserThatBet_" + i, i));
            }
        }
        else if(numOfWinnersToCreate > 1) for (Integer x = 1; x <= numOfWinnersToCreate; x++) {
            for (Integer i = 1; i <= 30; i++) {
                usersList.add(new UserRaffle("UserThatBet_" + x + "_" + i, i));
            }
        }
        else{
            // numOfWinnersToCreate < 1
            throw new Exception("ERROR: Winners count can't be less than 1");
        }

        // Wait for new raffle to start
        FluentWait<WebDriver> fluentWaitForFreshRaffle = new FluentWait<>(driver)
                .withTimeout(Duration.ofSeconds(30))
                .pollingEvery(Duration.ofMillis(200))
                .ignoring(NoSuchElementException.class);

        Boolean isFreshRaffle = fluentWaitForFreshRaffle
                .until(ExpectedConditions.textToBe(By.xpath("//*[@id=\"next-raffle\"]"), "New winner in 25s"));

        if (isFreshRaffle) {
            for (UserRaffle userRaffle : usersList) {
                userBetRaffle(driver, wait, userRaffle.name, userRaffle.number, false);
            }
        } else {
            driver.quit();
            throw new Exception("ERROR: Something went wrong when betting with defined users");
        }

        FluentWait<WebDriver> fluentWaitForNewRaffle = new FluentWait<>(driver)
                .withTimeout(Duration.ofSeconds(30))
                .pollingEvery(Duration.ofMillis(200))
                .ignoring(NoSuchElementException.class);

        Boolean isNewRaffle = fluentWaitForNewRaffle
                .until(ExpectedConditions.textToBe(By.xpath("//*[@id=\"next-raffle\"]"), "New winner in 28s"));

        // Check if any one of the users was selected as winner. It should be just one.
        if (isNewRaffle) {
            // Get first line of the <ul>
            WebElement winnersEl = driver.findElement(By.xpath("//*[@id=\"scores\"]/ul/li[1]"));
            WebElement raffledNumberEl = driver.findElement(By.xpath("//*[@id=\"scores\"]/ul/li[1]/span"));
            String winnersUlInnerHtml = winnersEl.getAttribute("innerHTML");
            String InningNUmberStr = raffledNumberEl.getAttribute("innerHTML");
            InningNUmberStr = InningNUmberStr.replace("#", "");
            Integer winningNumber = Integer.parseInt(InningNUmberStr);
            Integer pTo = winnersUlInnerHtml.lastIndexOf("<span style=");
            String result = winnersUlInnerHtml.substring(0, pTo);
            String[] usernames = result.split(", ");
            Integer countWinners = 0;
            for (UserRaffle userRaffle : usersList) {
                if (userRaffle.number == winningNumber) {
                    boolean userContainCorrectNumber = Arrays.stream(usernames).anyMatch(userRaffle.name::equals);
                    if (!userContainCorrectNumber)
                        throw new Exception("ERROR: User does not contain correct number");
                    else
                        countWinners++;
                }
            }
            if (countWinners != 2) {
                driver.quit();
                throw new Exception(
                        "ERROR: There were more than 2 winners difinned in this test case, should be just 2. it is "
                                + countWinners);
            }

        } else {
            driver.quit();
            throw new Exception("ERROR: Something went wrong when waiting for new raffle");
        }
    }
}
