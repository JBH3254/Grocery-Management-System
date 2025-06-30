import java.io.*;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.*;

/**
 * The {@code Q21} class reads time series data from a CSV file,
 * parses timestamps and values, and calculates/prints some form of average
 * (the exact calculation depends on the {@code Date} class implementation).
 */
public class Q21 {

    private final static DateTimeFormatter INPUT_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
    public final static int MIN_L_DATE_STR = 16;
    public final static int MONTHS = 12;
    public final static int DAYS = 31;
    public final static int HOURS = 24;

    /**
     * The main entry point of the program.
     * Calls the {@code manager} method to handle the file processing.
     * Catches and prints any {@code IOException} that might occur.
     *
     * @param args Command line arguments (not used).
     */
    public static void main(String[] args) {
        try {
            manager("time_series.csv");
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    /**
     * Manages the process of reading the file, storing timestamps, and calculating the average.
     * Calls {@code readQuestionFile} to read data into a map and then calls
     * {@code getAvarage} to process the stored data.
     *
     * @param file The path to the CSV file containing the time series data.
     * @throws IOException If an I/O error occurs while reading the file.
     */
    public static void manager(String file) throws IOException {
        HashMap<Integer, Date> timeStamps = new HashMap<Integer, Date>();
        readFile(file, timeStamps);
        getAverage(timeStamps);
    }

    /**
     * Reads the time series data from the specified file and stores it in a map.
     * Each line of the file is processed by the {@code checkAndSave} method.
     * The map uses the year as the key and a {@code Date} object (presumably custom)
     * to store the data associated with that year.
     *
     * @param filePath   The path to the CSV file.
     * @param timeStamps A map to store the timestamps and their associated data,
     * where the key is the year and the value is a {@code Date} object.
     * @throws IOException If an I/O error occurs while opening or reading the file.
     */
    public static void readFile(String filePath, HashMap<Integer, Date> timeStamps) throws IOException {
        try (BufferedReader reader = new BufferedReader(new FileReader(filePath))) {
            String line;
            while ((line = reader.readLine()) != null) {
                checkAndSave(line, timeStamps);
            }
        } catch (IOException e) {
            System.out.println("problem with openning file");
        }
    }

    /**
     * Checks if a line from the file is valid (length and format) and saves its data.
     * Extracts the date string and value string from the line. It then checks
     * if the date is in the correct format using {@code checkDateFormat} and if
     * the value is a valid double using {@code checkVal}. If both are valid,
     * it parses the date into a {@code LocalDateTime} object and adds the data
     * to the {@code timeStamps} map using {@code addToMap}.
     *
     * @param line       A line read from the CSV file.
     * @param timeStamps The map used to store the processed time series data.
     */
    private static void checkAndSave(String line, HashMap<Integer, Date> timeStamps) {
        String date;
        Double val;
        if (line.length() >= MIN_L_DATE_STR) {
            date = line.substring(0, MIN_L_DATE_STR);
            if (!checkDateFormat(date)) {
                return;
            }
            if (!checkVal(line.substring(MIN_L_DATE_STR + 1))) {
                return;
            }
            val = Double.parseDouble(line.substring(MIN_L_DATE_STR + 1));
            LocalDateTime dateTime = LocalDateTime.parse(date, INPUT_FORMATTER);
            addToMap(dateTime, val, timeStamps);
        }
    }

    /**
     * Adds the extracted date and value to the {@code timeStamps} map.
     * If the year of the timestamp is not already a key in the map, a new
     * entry is created. If the year exists, the value is added or updated
     * for the specific month, day, and hour within the {@code Date} object
     * associated with that year. The equality check in the else block
     * seems to be a custom comparison within the {@code Date} class.
     *
     * @param dT         The parsed {@code LocalDateTime} object.
     * @param val        The double value associated with the timestamp.
     * @param timeStamps The map storing the time series data.
     */
    private static void addToMap(LocalDateTime dT, Double val, HashMap<Integer, Date> timeStamps) {
        if (!timeStamps.containsKey(dT.getYear())) {
            timeStamps.put(dT.getYear(), new Date(dT.getMonthValue(), dT.getDayOfMonth(), dT.getHour(), dT.getMinute(), val));
        } else{
            timeStamps.get(dT.getYear()).setVal(dT.getMonthValue(), dT.getDayOfMonth(), dT.getHour(), dT.getMinute(), val);
        }
    }

    /**
     * Checks if a given date string conforms to the expected format ("dd/MM/yyyy HH:mm").
     * It attempts to parse the string using the predefined {@code formatter}.
     * If parsing is successful, it returns {@code true}; otherwise, it returns {@code false}.
     *
     * @param date The date string to validate.
     * @return {@code true} if the date string matches the expected format, {@code false} otherwise.
     */
    private static boolean checkDateFormat(String date) {
        try {
            LocalDateTime.parse(date, INPUT_FORMATTER);
            return true;
        } catch (DateTimeParseException e) {
            return false;
        }
    }

    /**
     * Checks if a given string can be parsed as a valid double value.
     * It also considers "NaN" as an invalid value.
     *
     * @param str The string to validate as a double.
     * @return {@code true} if the string is a valid double, {@code false} otherwise.
     */
    private static boolean checkVal(String str) {
        if (str == null || str.isEmpty() || str.equals("NaN")) {
            return false;
        }
        try {
            Double.parseDouble(str);
            return true;
        } catch (NumberFormatException e) {
            return false;
        }
    }

    /**
     * Calculates and prints the average value for each hour of each day of each month
     * for each year present in the {@code timeStamps} map. The actual calculation
     * is performed by the {@code getAvarage} method of the custom {@code Date} class.
     *
     * @param timeStamps The map containing the time series data, where the key is the year
     * and the value is a {@code Date} object holding the data for that year.
     */
    private static void getAverage(HashMap<Integer, Date> timeStamps) {
        for (Map.Entry<Integer, Date> entry : timeStamps.entrySet()) {
            for (int month = 0; month < MONTHS; month++) {
                for (int day = 0; day < DAYS; day++) {
                    for (int hour = 0; hour < HOURS; hour++) {
                        if (entry.getValue().getAverage(month, day, hour) != null) {
                            System.out.printf("%02d/%02d/%d %02d:00 ", day, month, entry.getKey(), hour);
                            System.out.println(entry.getValue().getAverage(month, day, hour));
                        }
                    }
                }
            }
        }
    }
}