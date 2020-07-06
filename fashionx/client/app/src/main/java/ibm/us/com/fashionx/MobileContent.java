package ibm.us.com.fashionx;

import android.content.Context;
import android.util.Log;

import com.ibm.caas.CAASContentItem;
import com.ibm.caas.CAASContentItemsList;
import com.ibm.caas.CAASContentItemsRequest;
import com.ibm.caas.CAASDataCallback;
import com.ibm.caas.CAASErrorResult;
import com.ibm.caas.CAASService;

import java.util.ArrayList;
import java.util.List;

public class MobileContent {

    public static final String CONTENT_ADVERTISEMENT = "fashion app/content types/advertisement";
    public static final String CONTENT_ALL = "fashion app/views/all";
    public static final String CONTENT_CATALOG = "fashion app/content types/catalog";
    public static final String CONTENT_SUGGESTION = "fashion app/content types/suggestion";

    public static final String ELEMENT_IMAGE = "image";
    public static final String ELEMENT_DISCOUNT = "discount";
    public static final String ELEMENT_PLACEMENT = "placement";

    private ArrayList<MobileContentListener>    observers;
    private CAASService                         service;

    public MobileContent(String server, String context, String instance, String user, String password) {
        observers = new ArrayList<>();

        setService(new CAASService(
                server,
                context,
                instance,
                user,
                password
        ));
    }

    public void advertise(String department) {
        String[] parts = department.split(" ");

        CAASContentItemsRequest request = new CAASContentItemsRequest(new CAASDataCallback<CAASContentItemsList>() {
            @Override
            public void onSuccess(CAASContentItemsList list) {
                List<CAASContentItem> items = list.getContentItems();

                Log.d("CONTENT", "Advertisement found.");

                for(MobileContentListener observer : observers) {
                    observer.onAdvertise(
                            items.get(0).getElement(ELEMENT_IMAGE).toString(),
                            items.get(0).getElement(ELEMENT_DISCOUNT).toString()
                    );
                }
            }

            @Override
            public void onError(CAASErrorResult caasErrorResult) {
                Log.d("CONTENT", "Advertisement fail.");
            }
        });

        for(String part : parts) {
            request.addAnyKeywords(part);
        }

        request.addElements(ELEMENT_IMAGE);
        request.addElements(ELEMENT_DISCOUNT);
        request.setPath(CONTENT_ADVERTISEMENT);
        request.setPageSize(1);

        getService().executeRequest(request);
    }

    public void all() {
        CAASContentItemsRequest request = new CAASContentItemsRequest(new CAASDataCallback<CAASContentItemsList>() {
            @Override
            public void onSuccess(CAASContentItemsList caasContentItemsList) {
                Log.d("CONTENT", "All found.");
            }

            @Override
            public void onError(CAASErrorResult caasErrorResult) {
                Log.d("CONTENT", "All fail.");
            }
        });
        request.setPath(CONTENT_ALL);
        getService().executeRequest(request);
    }

    public void catalog() {
        CAASContentItemsRequest request = new CAASContentItemsRequest(new CAASDataCallback<CAASContentItemsList>() {
            @Override
            public void onSuccess(CAASContentItemsList list) {
                ArrayList<CatalogItem>  items = new ArrayList<>();
                CatalogItem             department;
                List<CAASContentItem>   content = list.getContentItems();

                Log.d("CONTENT", "Catalog found.");

                for(CAASContentItem item : content) {
                    department = new CatalogItem();
                    department.title = item.getTitle();
                    department.image = item.getElement(ELEMENT_IMAGE).toString();
                    department.placement = item.getElement(ELEMENT_PLACEMENT).toString();
                    items.add(department);
                }

                for(MobileContentListener observer : observers) {
                    observer.onCatalog(items);
                }
            }

            @Override
            public void onError(CAASErrorResult caasErrorResult) {
                Log.d("CONTENT", "Catalog fail.");
            }
        });
        request.setPath(CONTENT_CATALOG);
        getService().executeRequest(request);
    }

    public void suggest(String weather) {
        String[] parts = weather.split("[ /]");

        Log.d("CONTENT", "Weather: " + weather);

        CAASContentItemsRequest request = new CAASContentItemsRequest(new CAASDataCallback<CAASContentItemsList>() {
            @Override
            public void onSuccess(CAASContentItemsList list) {
                List<CAASContentItem> items = list.getContentItems();

                Log.d("CONTENT", "Found suggestion (" + items.size() + ").");

                for(MobileContentListener observer : observers) {
                    observer.onSuggest(items.get(0).getElement(ELEMENT_IMAGE).toString());
                }
            }

            @Override
            public void onError(CAASErrorResult caasErrorResult) {
                Log.d("CONTENT", "Suggest failure.");
            }
        });

        for(String part : parts) {
            request.addAnyKeywords(part);
        }

        request.addElements(ELEMENT_IMAGE);
        request.setPath(CONTENT_SUGGESTION);
        request.setPageSize(1);

        getService().executeRequest(request);
    }

    public void setMobileContentListener(MobileContentListener observer) {
        observers.add(observer);
    }

    public CAASService getService() {
        return service;
    }

    public void setService(CAASService service) {
        this.service = service;
    }
}
