public class Monitor {
    private int turn = 0;
    public synchronized void waitForPrint(int num){
        while (num > turn){
            try {
                wait();
            }catch (InterruptedException e){
                e.printStackTrace();
            }
        }
    }
    public synchronized void donePrint(){
        turn++;
        notifyAll();
    }
}
