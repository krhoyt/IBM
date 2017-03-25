package main

// Import
// Including shim
import (
  "encoding/json"
  "errors"
  "fmt"

  "github.com/hyperledger/fabric/core/chaincode/shim"
)

// Structure
type Greeting struct {
  Prefix string `json: "prefix"`
  Name string `json: "name"`
}

// Main
func main() {
  err := shim.Start( new( Greeting ) )
  
  if err != nil {
    fmt.Printf( "Error starting chaincode: %s", err )
  }
}

// Init
func ( t *Greeting ) Init( stub shim.ChaincodeStubInterface, function string, args []string ) ( []byte, error ) {
  if len( args ) != 1 {
    return nil, errors.New( "Incorrect number of arguments. Expecting one." )
  }

  greeting, err := json.Marshal( Greeting{Prefix: "Hello", Name: "World"} )
  err = stub.PutState( "greeting", []byte( greeting ) ) 

  if err != nil {
    return nil, err
  }

  return nil, nil
}

// Invoke
func ( t *Greeting ) Invoke( stub shim.ChaincodeStubInterface, function string, args []string ) ( []byte, error ) {
  fmt.Println( "Invoke is running " + function + "." )

  // Decision tree
  if function == "init" { 
    return t.Init( stub, "init", args )
  } else if function == "write" {
    return t.write( stub, args )
  }

  fmt.Println( "Invoke did not find function: " + function )

  return nil, errors.New( "Received unknown function invocation: " + function )
}

// Query
func ( t *Greeting ) Query( stub shim.ChaincodeStubInterface, function string, args []string ) ( []byte, error ) {
  fmt.Println( "Query is running " + function )

  // Decision tree
  if function == "read" {
    return t.read( stub, args )
  }

  fmt.Println( "Query did not find function: " + function )

  return nil, errors.New( "Received unknown function query: " + function )
}

// Read
func ( t *Greeting ) read( stub shim.ChaincodeStubInterface, args []string ) ( []byte, error ) {
  var name string
  var rsp string
  var err error

  if len( args ) != 1 {
      return nil, errors.New( "Incorrect number of arguments. Expecting name to query." )
  }

  name = args[0]
  buffer, err := stub.GetState( name )

  if err != nil {
      rsp = "{\"Error\": \"Failed to get state for " + name + "\"}"
      return nil, errors.New( rsp )
  }

  return buffer, nil
}

// Write
func ( t *Greeting ) write( stub shim.ChaincodeStubInterface, args []string ) ( []byte, error ) {
  var name string
  var value string

  fmt.Println( "Running write." )

  if( len ( args ) != 2 ) {
    return nil, errors.New( "Incorrect number of arguments. Expecting two." )
  }

  name = args[0]
  value = args[1]

  err := stub.PutState( name, []byte( value ) )

  if err != nil {
    return nil, err
  }

  return nil, nil
}
