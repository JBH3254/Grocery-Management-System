import java.util.HashSet;
import java.util.Set;

public class Day {

    private Hour[] hours = new Hour[Q21.HOURS];
    Set<String> seen = new HashSet<>();
    /*public Day (){
        for (Hour hour : this.hours) {
            hour = new Hour();
        }
    }*/

    public Day (int hour, int minute, double val){
        this.hours[hour] = new Hour(val);
    }

    public void setVal(int hour, int minute, double val){
        String key = hour + ":" + minute + "=" + val;
        if (this.hours[hour]== null){
            this.hours[hour] = new Hour(val);
        }
        else {
            if (seen.add(key)) {
                this.hours[hour].setVal(val);
            }
        }
    }

    public String getAverage(int hour){
        if(this.hours[hour] == null){
            return null;
        }
        return this.hours[hour].getAverage();
    }
}
