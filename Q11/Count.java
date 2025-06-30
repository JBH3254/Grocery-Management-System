import java.util.HashMap;
import java.util.Map;
import java.io.*;
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReentrantLock;

public class Count implements Runnable{
    private File file;
    private Map<String, Integer> totalFreq;

    public Count(File file, Map<String, Integer> totalFreq) {
        this.file = file;
        this.totalFreq = totalFreq;
    }
    @Override
    public void run() {
        Map<String, Integer> fileFreq = new HashMap<>();
        try(BufferedReader reader = new BufferedReader(new FileReader(file))) {
            String line;
            while ((line = reader.readLine()) != null) {
                final int INDEX_OF_ERR_CODE = 40; // the index that the name of error is beginning there
                String errCode = "";
                errCode = line.substring(INDEX_OF_ERR_CODE, line.length() - 1);//cut just the name of error
                if (errCode.length() > 1) {
                    fileFreq.put(errCode, fileFreq.getOrDefault(errCode, 0) + 1);
                }
            }
        } catch (IOException e) {
            e.printStackTrace();
        }

        synchronized (totalFreq) {
            for (Map.Entry<String, Integer> entry : fileFreq.entrySet()) {
                totalFreq.merge(entry.getKey(), entry.getValue(), Integer::sum);
            }
        }
    }
}
