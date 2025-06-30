public class Date {
    private Month[] months = new Month[Q21.MONTHS];

    public Date (int month, int day, int hour, int second, double val){
        this.months[month] = new Month(day, hour, second, val);
    }

    public void setVal(int month, int day, int hour, int second, double val){
        if (this.months[month] == null){
            this.months[month] = new Month(day, hour, second, val);
        }
        else {
            this.months[month].setVal(day, hour, second, val);
        }
    }

    public String getAverage(int month, int day, int hour){
        if(this.months[month] == null){
            return null;
        }
        return this.months[month].getAverage(day, hour);
    }
}
