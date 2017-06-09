package ibm.us.com.fashionx;

import java.util.ArrayList;

public interface MobileContentListener {
    void onAdvertise(String path, String body);
    void onCatalog(ArrayList<CatalogItem> departments);
    void onSuggest(String path);
}
