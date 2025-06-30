import java.util.ArrayList;
import java.util.Arrays;
import java.util.Objects;

public class Hour {

    private final static int MINUTES = 60;
    private int amount;
    private double sumOfVal;

    public Hour (double val){
        this.amount = 1;
        this.sumOfVal = val;
    }

    public void setVal(double val){
        this.sumOfVal += val;
        this.amount++;
    }

    public String getAverage(){
        if(amount == 0){
            return null;
        }
        return (" "+(sumOfVal/amount));
    }
}

