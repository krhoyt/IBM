package ibm.us.com.contentmanagement;

import android.content.Intent;
import android.os.Bundle;
import android.support.v7.app.AppCompatActivity;
import android.view.View;
import android.widget.EditText;
import android.widget.ImageView;
import android.widget.TextView;

public class CreateActivity extends AppCompatActivity {

    private InstanceHelper  db;

    private EditText txtName;
    private EditText txtPassword;
    private EditText txtRoot;
    private EditText txtServer;
    private EditText txtUser;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_create);

        // User interface
        ImageView imgBack = (ImageView)findViewById(R.id.image_back);
        TextView txtCancel = (TextView)findViewById(R.id.text_cancel);
        TextView txtSave = (TextView)findViewById(R.id.text_save);

        txtPassword = (EditText)findViewById(R.id.edit_password);
        txtName = (EditText)findViewById(R.id.edit_name);
        txtRoot = (EditText)findViewById(R.id.edit_root);
        txtServer = (EditText)findViewById(R.id.edit_server);
        txtUser = (EditText)findViewById(R.id.edit_user);

        // Database
        db = new InstanceHelper(this);

        // Back
        imgBack.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                setResult(-1);
                finish();
            }
        });

        // Cancel
        txtCancel.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                setResult(-1);
                finish();
            }
        });

        // Save
        txtSave.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Instance instance = new Instance();
                Intent intent = new Intent();

                instance.server = txtServer.getText().toString();
                instance.root = txtRoot.getText().toString();
                instance.name = txtName.getText().toString();
                instance.user = txtUser.getText().toString();
                instance.password = txtPassword.getText().toString();

                db.create(instance);

                intent.putExtra("server", instance.server);
                intent.putExtra("root", instance.root);
                intent.putExtra("name", instance.name);
                intent.putExtra("user", instance.user);
                intent.putExtra("password", instance.password);

                setResult(0, intent);
                finish();
            }
        });
    }

}
