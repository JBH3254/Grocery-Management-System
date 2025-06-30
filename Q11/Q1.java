import java.io.*;
import java.util.*;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class Q1 {
    private static String DIR_NAME = "logs_parts";
    private static int divideFile(String inputFilePath) throws IOException {
        final int NUM_OF_LINES=10000;
        try (BufferedReader reader = new BufferedReader(new FileReader(inputFilePath))) {
            File outputDir = new File(DIR_NAME);
            if (!outputDir.exists()) {
                outputDir.mkdir();
            }
            int lineCounter = 0;
            int fileCounter = 1;
            PrintWriter writer = null;
            try {
                writer = new PrintWriter(new FileWriter(new File(outputDir,"logs_part_" + fileCounter + ".txt")));
                String line;
                while ((line = reader.readLine()) != null) {
                    if (lineCounter >= NUM_OF_LINES) {
                        writer.close();
                        fileCounter++;
                        writer = new PrintWriter(new FileWriter(new File(outputDir,"logs_part_" + fileCounter + ".txt")));
                        lineCounter = 0;
                    }
                    writer.println(line);
                    lineCounter++;
                }
                writer.close();
                return fileCounter;
            }
            catch (IOException e){
                System.out.println("problem with creating files");
            }
        } catch (IOException e) {
            System.out.println("problem with opening file ");
        }
        return -1;
    }
    public static void main(String[] args) {
        try {
            Scanner s = new Scanner(System.in);
            System.out.println("enter the amount of the highest frequencies you want get");
            int N = s.nextInt();
            manager("logs.txt", N);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
    public static void manager(String file, int N) throws IOException {
        HashMap<String, Integer> frequency = new HashMap<String, Integer>();
        int n = divideFile(file);
        if(n != -1) {
            countManager(frequency);
            printNMax(frequency, N);
        }
    }
    public static void countManager(HashMap<String, Integer> frequency){
        final int MAX_THREADS = 10;
        File folder = new File("logs_parts");
        File[] files = folder.listFiles((dir, name) -> name.endsWith(".txt"));
        ExecutorService executor = Executors.newFixedThreadPool(MAX_THREADS);

        for (File file : files) {
            Count thread = new Count(file, frequency);
            executor.execute(thread);
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
    public static void printNMax(HashMap<String, Integer> frequency, int N) {
        List<Map.Entry<String, Integer>> list = new ArrayList<>(frequency.entrySet());
        Collections.sort(list, Comparator.comparing(Map.Entry::getValue));
        for (int i = 0; i < N && !list.isEmpty(); i++) {
            System.out.println(list.get(list.size() - 1 - i).getKey() + ": " + list.get(list.size() - 1 - i).getValue());
        }
    }
}
