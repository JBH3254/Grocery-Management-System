import java.io.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReentrantLock;


public class Average implements Runnable{
    private final static int HOURS = 24;
    private final static int MIN_L_DATE_STR = 16;
    private static final DateTimeFormatter INPUT_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
    private static final DateTimeFormatter FILE_FORMATTER = DateTimeFormatter.ofPattern("yyyyMMdd");
    private File file;
    private Hour[] hours = new Hour[HOURS];
    private int fileNum;
    private Monitor m;
    LocalDate date;

    public Average(File file, int fileNum, Monitor m) {
        this.file = file;
        this.fileNum = fileNum;
        this.m = m;
        this.date = LocalDate.parse(file.getName().substring(0,8), FILE_FORMATTER);
    }
    @Override
    public void run() {
        Set<String> seen = new HashSet<>();
            try (BufferedReader reader = new BufferedReader(new FileReader(file))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    double val = Double.parseDouble(line.substring(MIN_L_DATE_STR + 1));
                    LocalDateTime dateTime = LocalDateTime.parse(line.substring(0, MIN_L_DATE_STR), INPUT_FORMATTER);
                    int minute = dateTime.getMinute();
                    int hour = dateTime.getHour();
                    String key = hour + ":" + minute + "=" + val;
                    if (hours[hour] == null) {
                        hours[hour] = new Hour(val);
                    } else {
                        if (seen.add(key)) {
                            hours[hour].setVal(val);
                        }
                    }
                }
            } catch (IOException e) {
                e.printStackTrace();
            }
        m.waitForPrint(fileNum);
        printAverage(date.getYear(), date.getMonthValue(), date.getDayOfMonth());
        m.donePrint();
    }
    public void printAverage(int year, int month, int hour){
        for (int i = 0; i < HOURS; i++) {
            if (hours[i] != null) {
                String lineToOutput = String.format("%d/%d/%d %02d:00 -> %s", year, month, hour, i, hours[i].getAverage());
                System.out.println(lineToOutput);
            }
        }
    }
}
