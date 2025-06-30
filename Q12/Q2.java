import java.io.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class Q2 {
    private static final DateTimeFormatter INPUT_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
    private static final DateTimeFormatter OUTPUT_FILE_FORMATTER = DateTimeFormatter.ofPattern("yyyyMMdd");
    private static final String OUTPUT_DIR = "daily_files";
    private final static int MIN_L_DATE_STR = 16;

    public static void main(String[] args) {
        try {
            manager("time_series.csv");
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    private static void manager(String inputFilePath) throws IOException {
        splitCsvByDayToFile(inputFilePath);
        average();
    }

    public static void average(){
        final int MAX_THREADS = 10;
        File folder = new File(OUTPUT_DIR);
        File[] files = folder.listFiles((dir, name) -> name.endsWith(".csv"));
        ExecutorService executor = Executors.newFixedThreadPool(MAX_THREADS);
        int fileNum = 0;
        Monitor m = new Monitor();
        for (File file : files) {
            Average thread = new Average(file, fileNum, m);
            executor.execute(thread);
            fileNum++;
        }
        executor.shutdown();
        while (!executor.isTerminated()) {
            try {
                Thread.sleep(100);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
    }

    public static void splitCsvByDayToFile(String inputFilePath) throws IOException {
        File outputDir = new File(OUTPUT_DIR);
        if (!outputDir.exists()) {
            outputDir.mkdirs();
        }
        readAndWriteFile(inputFilePath);
    }
    private static void readAndWriteFile(String inputFilePath) throws IOException {
        Map<LocalDate, BufferedWriter> writers = new HashMap<>();
        try (BufferedReader reader = new BufferedReader(new FileReader(inputFilePath))) {
            String line;
            while ((line = reader.readLine()) != null) {
                LocalDateTime dateTime = checkAndGetDate(line);
                writeFiles(line, dateTime, writers);
            }
            for (BufferedWriter writer : writers.values()) {
                try {
                    if (writer != null) {
                        writer.close();
                    }
                } catch (IOException e) {
                    System.err.println("error in closing file " + e.getMessage());
                }
            }
        } catch (IOException e) {
            System.out.println("problem with opening file ");
        }
    }

    public static void writeFiles(String line, LocalDateTime dateTime, Map<LocalDate, BufferedWriter> writers) throws IOException{
        try {
            if(dateTime == null)
                return;
            LocalDate date = dateTime.toLocalDate();
            String outputFileName = OUTPUT_DIR + File.separator + date.format(OUTPUT_FILE_FORMATTER) + ".csv";
            BufferedWriter writer = writers.computeIfAbsent(date, d -> {
                try {
                    BufferedWriter newWriter = new BufferedWriter(new FileWriter(outputFileName));
                    return newWriter;
                } catch (IOException e) {
                    System.err.println("error in create file" + outputFileName + " - " + e.getMessage());
                    return null;
                }
            });
            if (writer != null && line !=null) {
                writer.write(line);
                writer.newLine();
            }
        } catch (IOException e) {
            System.err.println("error in writing to file " + line + " - " + e.getMessage());
        }
    }
    private static LocalDateTime checkAndGetDate(String line) {
        String date;
        if (line.length() >= MIN_L_DATE_STR) {
            date = line.substring(0, MIN_L_DATE_STR);
            if (!checkDateFormat(date)) {
                return null;
            }
            if (!checkVal(line.substring(MIN_L_DATE_STR + 1))) {
                return null;
            }
            LocalDateTime dateTime = LocalDateTime.parse(date, INPUT_FORMATTER);
            return dateTime;
        }
        return null;
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
}
