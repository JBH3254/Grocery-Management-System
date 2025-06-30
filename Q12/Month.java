import java.util.Arrays;

public class Month {
    private Day[] days = new Day[Q21.DAYS];

    public Month (int day, int hour, int second, double val){
        this.days[day] = new Day(hour, second, val);
    }

    public void setVal(int day, int hour, int second, double val){
        if (this.days[day] == null){
            this.days[day] = new Day(hour, second, val);
        }
        else {
            this.days[day].setVal(hour, second, val);
        }
    }

    public String getAverage(int day, int hour){
        if(this.days[day] == null){
            return null;
        }
        return this.days[day].getAverage(hour);
    }
}
