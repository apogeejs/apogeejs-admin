import {createModel,runActionSequence,destroyModel} from "./actionRunner.js";

export default function runTests() {
    //==================
    //create empty model
    //==================
    let createModelSequence = {};
    let success = createModel(createModelSequence);
    if(!success) {
        console.log("Model creation failed!");
        return;
    }

    //get the main folder ID
    let emptyModel = createModelSequence.currentModel;

    //lookup child ID from model
    let mainFolderId = emptyModel.lookupChildId("main");

    //===============
    //test sequence 1
    //===============
    let testSequence1 = {
        initialModel: emptyModel,
        actionList: [
            {
                action: "createMember",
                parentId: mainFolderId, 
                createData: {
                    type: "apogee.JsonMember",
                    name: "DUMMY_VAL",
                    fields: {
                        data: 8
                    }
                }
            },
            {
                action: "createMember",
                parentId: mainFolderId, 
                createData: {
                    type: "apogee.FunctionMember",
                    name: "foo",
                    fields: {
                        argList: ["x"],
                        functionBody: "return DUMMY_VAL * x",
                        supplementalCode: ""
                    }
                }
            },
            {
                action: "createMember",
                parentId: mainFolderId, 
                createData: {
                    type: "apogee.JsonMember",
                    name: "xxx",
                    fields: {
                        argList: [],
                        functionBody: "return foo(3)",
                        supplementalCode: ""
                    }
                }
            }
        ]
    }

    success = runActionSequence(testSequence1);
    if(!success) {
        console.log("Test sequence failed!");
        return;
    }

    let model1 = testSequence1.currentModel;
    let dummyValMemberId;
    let fooMemberId;
    let xxxMemberId;
    {
        //load some values
        //get a member instance by ID
        let mainFolder = model1.lookupMemberById(mainFolderId);

        //load up child IDs
        dummyValMemberId = mainFolder.lookupChildId("DUMMY_VAL");
        fooMemberId = mainFolder.lookupChildId("foo");

        //look up child instance
        let xxxMember = mainFolder.lookupChild(model1,"xxx");

        console.log("Value: " + xxxMember.getData());

        xxxMemberId = xxxMember.getId();
    }

    //===============
    //test sequence 2
    //===============
    let testSequence2 = {
        initialModel: model1,
        actionList: [
            {
                action: "updateData",
                memberId: dummyValMemberId, 
                data: 67
            }
        ]
    }

    success = runActionSequence(testSequence2);
    if(!success) {
        console.log("Test sequence failed!");
        return;
    }

    let model2 = testSequence2.currentModel;
    {
        //look up a member by full name from the model (granted - we already know the id. This is just for an example.)
        let xxxMember = model2.getMemberByFullName(model2,"main.xxx");
        console.log("Value: " + xxxMember.getData());
    }
    
    
}