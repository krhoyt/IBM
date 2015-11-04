package ibm.us.com.contentmanagement;

public class ListPart {
    public boolean  ascending;
    public String   key;
    public String   part;

    public ListPart(String part) {
        this.part = part;
        ascending = false;

        parse();
    }

    public ListPart() {
        ascending = false;
    }

    public void parse(String part) {
        this.part = part;
        parse();
    }

    public void parse() {
        part = part.trim();

        if(part.indexOf("-") == 0) {
            key = part.substring(1, part.length());
            ascending = false;
        } else {
            key = part;
            ascending = true;
        }
    }
}
