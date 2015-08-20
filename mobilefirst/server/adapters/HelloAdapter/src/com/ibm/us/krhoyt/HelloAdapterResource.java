package com.ibm.us.krhoyt;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;

@Path("/hello")
public class HelloAdapterResource 
{
	/* <server address>/MyProject/adapters/HelloAdapter/hello */
	@GET
	@Path("/{name}")
	public String hello(@PathParam("name") String name) {		
		return "Hello " + name.trim() + "!";
	}
}
