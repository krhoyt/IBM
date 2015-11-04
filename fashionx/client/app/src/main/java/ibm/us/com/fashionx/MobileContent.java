package ibm.us.com.fashionx;

import android.content.Context;
import android.util.Log;
import android.widget.ImageView;

import com.ibm.caas.CAASContentItem;
import com.ibm.caas.CAASContentItemsList;
import com.ibm.caas.CAASContentItemsRequest;
import com.ibm.caas.CAASDataCallback;
import com.ibm.caas.CAASErrorResult;
import com.ibm.caas.CAASService;

import java.util.ArrayList;
import java.util.List;

public class MobileContent {

    public static final String ELEMENT_IMAGE = "image";

    private ArrayList<MobileContentListener>    observers;
    private CAASService                         service;
    private Context                             context;
    private String                              path;

    public MobileContent(Context context, String path) {
        this.context = context;
        this.path = path;

        observers = new ArrayList<>();

        setService(new CAASService(
            context.getString(R.string.macm_server),
            context.getString(R.string.macm_context),
            context.getString(R.string.macm_instance),
            context.getString(R.string.macm_user),
            context.getString(R.string.macm_password)
        ));
    }

    public void all(String type) {
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
        request.setPath(path);
        getService().executeRequest(request);
    }

    public void suggest(String phrase) {
        String[] parts = phrase.split("[ /]");

        CAASContentItemsRequest request = new CAASContentItemsRequest(new CAASDataCallback<CAASContentItemsList>() {
            @Override
            public void onSuccess(CAASContentItemsList list) {
                List<CAASContentItem> items = list.getContentItems();

                Log.d("CONTENT", "Found suggestion.");

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
        request.setPath(path);
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
