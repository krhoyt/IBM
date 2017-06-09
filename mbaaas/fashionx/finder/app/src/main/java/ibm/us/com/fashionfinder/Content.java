package ibm.us.com.fashionfinder;

import android.util.Log;

import com.ibm.caas.CAASContentItem;
import com.ibm.caas.CAASContentItemsList;
import com.ibm.caas.CAASContentItemsRequest;
import com.ibm.caas.CAASDataCallback;
import com.ibm.caas.CAASErrorResult;
import com.ibm.caas.CAASService;

import java.util.ArrayList;
import java.util.List;

public class Content {

    public static final String CONTENT_SENSOR = "fashion app/content types/sensor";
    public static final String ELEMENT_IMAGE = "image";

    private ArrayList<ContentListener>  observers;
    private CAASService                 service;

    public Content(String server, String context, String instance, String user, String password) {
        observers = new ArrayList<>();

        service = new CAASService(
            server,
            context,
            instance,
            user,
            password
        );
    }

    public void fashion(ArrayList<String> keywords) {
        CAASContentItemsRequest request = new CAASContentItemsRequest(new CAASDataCallback<CAASContentItemsList>() {
            @Override
            public void onSuccess(CAASContentItemsList list) {
                List<CAASContentItem> items = list.getContentItems();

                Log.d("CONTENT", "Fashion found.");

                for (ContentListener observer:observers) {
                    observer.onFashion(
                        items.get(0).getElement(ELEMENT_IMAGE).toString()
                    );
                }
            }

            @Override
            public void onError(CAASErrorResult caasErrorResult) {
                Log.d("CONTENT", "Fashion fail.");
            }
        });

        for(String keyword:keywords) {
            request.addAnyKeywords(keyword);
        }

        request.addElements(ELEMENT_IMAGE);
        request.setPath(CONTENT_SENSOR);
        request.setPageSize(1);

        service.executeRequest(request);
    }

    public CAASService getService() {
        return service;
    }

    public void setContentListener(ContentListener observer) {
        observers.add(observer);
    }

}
